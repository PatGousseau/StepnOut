import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
// npm: specifier rather than the esm.sh URL used elsewhere in this folder:
// esm.sh serves an X-TypeScript-Types header pointing at an undici-types .d.ts
// the edge runtime cannot resolve, which fails the worker at boot.
import OpenAI from 'npm:openai@6.27.0';
import { corsHeaders } from '../_shared/cors.ts';
import { getPromptContent, applyTemplate } from '../_shared/prompts.ts';
import {
  QUEST_GENERATION_SCHEMA,
  sanitizeQuestPair,
  sanitizeReadback,
} from '../_shared/personalizedQuest.ts';

// Produces the read-back lines and the two quests, and writes the quests into
// side_quests scoped to the caller.
//
// Called twice per intake: speculatively right after Q2, then again with the
// follow-up answer if one came back. The second call replaces the first call's
// quests for the same intake — they are not referenced by anything yet.

type Body = {
  intake_id?: number;
  answer_avoided?: string;
  answer_bail?: string;
  answer_solo_experience?: string;
  location_raw?: string;
  followup_question?: string;
  followup_answer?: string;
  locale?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'missing supabase env' }, 500);
  }
  if (!openaiApiKey) {
    return json({ error: 'missing openai env' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'missing authorization' }, 401);
  }

  // Service role is required to read `prompts` (RLS on, no select policy).
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  const user = userData?.user;
  if (!user) {
    return json({ error: 'invalid authorization' }, 401);
  }

  try {
    const body = (await req.json()) as Body;
    const intakeId = body.intake_id;

    if (!intakeId) {
      return json({ error: 'intake_id is required' }, 400);
    }

    // Service role bypasses RLS, so ownership is checked explicitly.
    const { data: intake, error: intakeError } = await admin
      .from('personalized_quest_intakes')
      .select('id, user_id')
      .eq('id', intakeId)
      .maybeSingle();

    if (intakeError) {
      throw new Error(`intake fetch error: ${intakeError.message}`);
    }
    if (!intake || intake.user_id !== user.id) {
      return json({ error: 'intake not found' }, 404);
    }

    const locale = body.locale === 'en' ? 'en' : 'it';
    const none = locale === 'en' ? 'not given' : 'non indicato';

    const vars = {
      answer_avoided: (body.answer_avoided || '').trim() || none,
      answer_bail: (body.answer_bail || '').trim() || none,
      answer_solo_experience: (body.answer_solo_experience || '').trim() || none,
      location_raw: (body.location_raw || '').trim() || none,
      followup_question: (body.followup_question || '').trim() || none,
      followup_answer: (body.followup_answer || '').trim() || none,
    };

    const [readbackTemplate, generationTemplate] = await Promise.all([
      getPromptContent(admin, 'personalized_quest_readback', locale),
      getPromptContent(admin, 'personalized_quest_generation', locale),
    ]);

    if (!readbackTemplate || !generationTemplate) {
      return json({ error: 'missing_prompt_template' }, 500);
    }

    const prompt = [
      applyTemplate(readbackTemplate, vars),
      '---',
      applyTemplate(generationTemplate, vars),
    ].join('\n\n');

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const res = await openai.responses.create({
      model: 'gpt-4.1-mini',
      temperature: 0.9,
      input: [
        {
          role: 'system',
          content:
            'You design concrete personal challenges and write blunt, specific read-backs. Never mention AI or being a model. No therapy-speak, no validation, no generic motivation.',
        },
        { role: 'user', content: prompt },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'personalized_quests',
          strict: true,
          schema: QUEST_GENERATION_SCHEMA,
        },
      },
    });

    const text = res.output_text;
    if (!text) {
      return json({ error: 'empty_model_response' }, 502);
    }

    let parsed: { readback?: unknown; quests?: unknown };
    try {
      parsed = JSON.parse(text);
    } catch {
      return json({ error: 'unparseable_model_response' }, 502);
    }

    const readback = sanitizeReadback(parsed.readback);
    const quests = sanitizeQuestPair(parsed.quests);

    // Replace any quests from an earlier (speculative) run for this intake.
    // Nothing references them yet, so this is safe.
    const { error: deleteError } = await admin
      .from('side_quests')
      .delete()
      .eq('intake_id', intakeId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`quest cleanup error: ${deleteError.message}`);
    }

    const { data: inserted, error: insertError } = await admin
      .from('side_quests')
      .insert(
        quests.map((quest) => ({
          ...quest,
          user_id: user.id,
          source: 'personalized',
          intake_id: intakeId,
          is_active: true,
        })),
      )
      .select('*');

    if (insertError) {
      throw new Error(`quest insert error: ${insertError.message}`);
    }

    const { error: updateError } = await admin
      .from('personalized_quest_intakes')
      .update({ readback_lines: readback, updated_at: new Date().toISOString() })
      .eq('id', intakeId);

    if (updateError) {
      throw new Error(`intake update error: ${updateError.message}`);
    }

    return json({ readback, quests: inserted || [] });
  } catch (error) {
    console.error('generate-personalized-quests error:', error);
    return json({ error: 'generation_failed' }, 500);
  }
});
