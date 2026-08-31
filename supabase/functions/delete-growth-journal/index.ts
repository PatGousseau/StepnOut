import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

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
  const authorization = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
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
  try {
    const body = await req.json();
    const interactionId = typeof body?.interaction_id === "string"
      ? body.interaction_id
      : "";
    const requestedVoiceId = typeof body?.voice_journal_id === "string"
      ? body.voice_journal_id
      : "";
    if (!interactionId && !requestedVoiceId) {
      return respond({ error: "journal_id_required" }, 400);
    }

    let voiceJournalId = requestedVoiceId;
    if (interactionId) {
      const { data: interaction, error: interactionError } = await service
        .from("growth_interactions")
        .select("id, kind, voice_journal_id")
        .eq("id", interactionId)
        .eq("user_id", authData.user.id)
        .maybeSingle();
      if (interactionError) throw interactionError;
      if (!interaction || interaction.kind !== "journal") {
        return respond({ error: "journal_not_found" }, 404);
      }
      voiceJournalId = interaction.voice_journal_id || "";
    }

    if (voiceJournalId) {
      const { data: voice, error: voiceError } = await service
        .from("growth_voice_journals")
        .select("id, object_path, status")
        .eq("id", voiceJournalId)
        .eq("user_id", authData.user.id)
        .maybeSingle();
      if (voiceError) throw voiceError;
      if (!voice) return respond({ error: "voice_journal_not_found" }, 404);
      if (!interactionId && voice.status === "submitted") {
        return respond(
          { error: "submitted_journal_requires_interaction" },
          409,
        );
      }
      const { error: removeError } = await service.storage
        .from("growth-journal-audio")
        .remove([voice.object_path]);
      if (removeError) throw removeError;
    }

    if (interactionId) {
      const { error: deleteError } = await service.rpc(
        "delete_growth_journal_for_user",
        { p_user_id: authData.user.id, p_interaction_id: interactionId },
      );
      if (deleteError) throw deleteError;
    } else {
      const { error: deleteDraftError } = await service.rpc(
        "delete_growth_voice_draft_for_user",
        {
          p_user_id: authData.user.id,
          p_voice_journal_id: voiceJournalId,
        },
      );
      if (deleteDraftError) throw deleteDraftError;
    }

    return respond({ deleted: true });
  } catch (error) {
    console.error("delete-growth-journal failed:", error);
    return respond({ error: "journal_deletion_failed" }, 500);
  }
});
