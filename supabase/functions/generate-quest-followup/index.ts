import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
// npm: specifier rather than the esm.sh URL used elsewhere in this folder:
// esm.sh serves an X-TypeScript-Types header pointing at an undici-types .d.ts
// the edge runtime cannot resolve, which fails the worker at boot.
import OpenAI from 'npm:openai@6.27.0';
import { corsHeaders } from '../_shared/cors.ts';
import { getPromptContent, applyTemplate } from '../_shared/prompts.ts';

// Generates the single follow-up question shown mid-intake. The client fires
// this speculatively and never blocks on it: if it is slow, errors, or the
// model decides the question would not change anything, the flow skips it.

type Body = {
  answer_avoided?: string;
  answer_bail?: string;
  locale?: string;
};

type Followup = {
  skip: boolean;
  question: string | null;
  variant: 'clarify' | 'deepen' | null;
};

const FOLLOWUP_SCHEMA = {
  type: 'object',
  properties: {
    skip: {
      type: 'boolean',
      description: 'True when the question would not change the quest, its difficulty, or the read-back.',
    },
    question: { type: ['string', 'null'], maxLength: 100 },
    variant: { type: ['string', 'null'], enum: ['clarify', 'deepen', null] },
  },
  required: ['skip', 'question', 'variant'],
  additionalProperties: false,
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const SKIPPED: Followup = { skip: true, question: null, variant: null };

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
  if (!userData?.user) {
    return json({ error: 'invalid authorization' }, 401);
  }

  try {
    const body = (await req.json()) as Body;
    const answerAvoided = (body.answer_avoided || '').trim();
    const answerBail = (body.answer_bail || '').trim();

    // Nothing to build a follow-up from.
    if (!answerAvoided && !answerBail) {
      return json(SKIPPED);
    }

    const locale = body.locale === 'en' ? 'en' : 'it';
    const template = await getPromptContent(admin, 'personalized_quest_followup', locale);

    if (!template) {
      return json(SKIPPED);
    }

    const prompt = applyTemplate(template, {
      answer_avoided: answerAvoided,
      answer_bail: answerBail,
    });

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const res = await openai.responses.create({
      model: 'gpt-4.1-mini',
      temperature: 0.7,
      input: [
        {
          role: 'system',
          content:
            'You write a single sharp follow-up question for a self-development app. Never mention AI or being a model. Never use therapy-speak.',
        },
        { role: 'user', content: prompt },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'quest_followup',
          strict: true,
          schema: FOLLOWUP_SCHEMA,
        },
      },
    });

    const text = res.output_text;
    if (!text) return json(SKIPPED);

    let parsed: Partial<Followup> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json(SKIPPED);
    }

    const question = typeof parsed?.question === 'string' ? parsed.question.trim() : '';
    const variant = parsed?.variant === 'clarify' || parsed?.variant === 'deepen' ? parsed.variant : null;

    // A question without a usable variant is not worth a screen.
    if (parsed?.skip || !question || !variant) {
      return json(SKIPPED);
    }

    return json({ skip: false, question, variant } satisfies Followup);
  } catch (error) {
    console.error('generate-quest-followup error:', error);
    // The intake treats any failure as "no follow-up", so this stays a 200.
    return json(SKIPPED);
  }
});
