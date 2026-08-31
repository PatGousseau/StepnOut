import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import { validateVoiceJournalM4a } from "../_shared/m4a.ts";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";
const TRANSCRIPTION_TIMEOUT_MS = 60000;
const STALE_CLAIM_MS = 90000;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_VERIFIED_DURATION_MS = 181000;

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return respond({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  const authorization = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !openaiApiKey) {
    return respond({ error: "missing_server_configuration" }, 500);
  }
  if (!authorization) return respond({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data: authData, error: authError } = await userClient.auth.getUser(
    token,
  );
  if (authError || !authData.user) {
    return respond({ error: "unauthorized" }, 401);
  }

  const service = createClient(supabaseUrl, serviceRoleKey);
  let voiceJournalId = "";
  try {
    const body = await req.json();
    voiceJournalId = typeof body?.voice_journal_id === "string"
      ? body.voice_journal_id
      : "";
    const locale = body?.locale === "it" ? "it" : "en";
    if (!voiceJournalId) {
      return respond({ error: "voice_journal_id_required" }, 400);
    }

    const { data: voice, error: voiceError } = await service
      .from("growth_voice_journals")
      .select(
        "id, user_id, status, object_path, mime_type, duration_ms, machine_transcript, updated_at",
      )
      .eq("id", voiceJournalId)
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (voiceError) throw voiceError;
    if (!voice) return respond({ error: "voice_journal_not_found" }, 404);
    if (voice.status === "submitted") {
      return respond({ error: "voice_journal_already_submitted" }, 409);
    }
    if (voice.status === "review" && voice.machine_transcript) {
      return respond({
        voice_journal: voice,
        transcript: voice.machine_transcript,
      });
    }
    if (
      voice.status === "transcribing" &&
      Date.now() - new Date(voice.updated_at).getTime() < STALE_CLAIM_MS
    ) {
      return respond({ error: "transcription_in_progress" }, 409);
    }

    let claim = service
      .from("growth_voice_journals")
      .update({
        status: "transcribing",
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", voice.id)
      .eq("user_id", authData.user.id);
    claim = voice.status === "transcribing"
      ? claim.eq("status", "transcribing").lt(
        "updated_at",
        new Date(Date.now() - STALE_CLAIM_MS).toISOString(),
      )
      : claim.in("status", ["uploading", "failed"]);
    const { data: claimed, error: claimError } = await claim
      .select("id")
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return respond({ error: "transcription_in_progress" }, 409);

    const { data: audio, error: downloadError } = await service.storage
      .from("growth-journal-audio")
      .download(voice.object_path);
    if (downloadError || !audio) {
      throw new Error("audio_download_failed");
    }
    if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
      throw new Error("audio_size_invalid");
    }
    const audioBytes = new Uint8Array(await audio.arrayBuffer());
    validateVoiceJournalM4a(
      audioBytes,
      voice.duration_ms,
      MAX_VERIFIED_DURATION_MS,
    );

    const { data: quotaClaimed, error: quotaError } = await service.rpc(
      "claim_growth_voice_transcription_for_user",
      { p_user_id: authData.user.id, p_voice_journal_id: voice.id },
    );
    if (quotaError) throw quotaError;
    if (!quotaClaimed) throw new Error("transcription_rate_limited");

    const form = new FormData();
    form.append(
      "file",
      new File([audioBytes], `${voice.id}.m4a`, { type: voice.mime_type }),
    );
    form.append("model", TRANSCRIPTION_MODEL);
    form.append("response_format", "json");
    form.append("language", locale);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      TRANSCRIPTION_TIMEOUT_MS,
    );
    let transcriptionResponse: Response;
    try {
      transcriptionResponse = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiApiKey}` },
          body: form,
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }
    if (!transcriptionResponse.ok) {
      throw new Error(
        `transcription_request_failed_${transcriptionResponse.status}`,
      );
    }
    const transcription = await transcriptionResponse.json();
    const transcript = typeof transcription?.text === "string"
      ? transcription.text.trim()
      : "";
    if (!transcript) throw new Error("empty_transcript");
    if (transcript.length > 4000) throw new Error("transcript_too_long");

    const { data: saved, error: saveError } = await service
      .from("growth_voice_journals")
      .update({
        status: "review",
        machine_transcript: transcript,
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", voice.id)
      .eq("user_id", authData.user.id)
      .eq("status", "transcribing")
      .select(
        "id, plan_id, step_id, status, object_path, mime_type, duration_ms, machine_transcript, reviewed_transcript, transcript_edited, created_at, updated_at, submitted_at",
      )
      .single();
    if (saveError) throw saveError;
    return respond({ voice_journal: saved, transcript });
  } catch (error) {
    if (voiceJournalId) {
      const message = error instanceof Error
        ? error.message
        : "transcription_failed";
      await service.from("growth_voice_journals").update({
        status: "failed",
        last_error: message.slice(0, 80),
        updated_at: new Date().toISOString(),
      }).eq("id", voiceJournalId).eq("user_id", authData.user.id)
        .eq("status", "transcribing");
    }
    console.error("transcribe-growth-journal failed:", error);
    const rateLimited = error instanceof Error &&
      error.message === "transcription_rate_limited";
    return respond(
      {
        error: rateLimited
          ? "voice_transcription_rate_limited"
          : "voice_transcription_failed",
      },
      rateLimited ? 429 : 500,
    );
  }
});
