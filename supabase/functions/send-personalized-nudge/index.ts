/// <reference types="https://deno.land/x/supabase_functions@1.3.3/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import OpenAI from 'https://esm.sh/openai@4.86.1';
import { corsHeaders } from '../_shared/cors.ts';
import { getPromptContent, applyTemplate } from '../_shared/prompts.ts';
import { sendExpoPushBatches, PushMessage } from '../_shared/notifications.ts';
import { truncate } from '../_shared/utils.ts';

type CandidateRow = {
  user_id: string;
  push_token: string;
  name: string | null;
  last_challenge_title: string | null;
  days_since_last_open: number;
  total_challenges_completed: number;
  streak: number;
};

type Copy = { title: string; body: string };

async function generatePersonalizedCopy(
  openai: OpenAI,
  prompt: string,
): Promise<Copy | null> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content:
          'Scrivi notifiche push brevi per una app social. Tono caldo, naturale, non giudicante. Nessun riferimento ad AI o LLM.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const text = res.choices[0]?.message?.content;
  if (!text) return null;

  let parsed: { title?: string; body?: string } | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (!parsed?.title || !parsed?.body) return null;

  return {
    title: truncate(String(parsed.title), 40),
    body: truncate(String(parsed.body), 100),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: 'missing supabase env' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!openaiApiKey) {
    return new Response(JSON.stringify({ error: 'missing openai env' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const { data: candidates, error: candidatesError } = await supabase.rpc(
      'get_personalized_nudge_candidates',
    );

    if (candidatesError) {
      throw new Error(`candidates rpc error: ${candidatesError.message}`);
    }

    const maxUsers = Number(new URL(req.url).searchParams.get('maxUsers') || '0');
    const allCandidates = (candidates || []) as CandidateRow[];
    const selected = maxUsers > 0 ? allCandidates.slice(0, maxUsers) : allCandidates;

    if (selected.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, reason: 'no_candidates' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const promptTemplate =
      (await getPromptContent(supabase, 'personalized_nudge')) || '';

    if (!promptTemplate) {
      return new Response(
        JSON.stringify({ sent: 0, reason: 'missing_prompt_template' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const messages: PushMessage[] = [];
    const logRows: Record<string, unknown>[] = [];

    for (const c of selected) {
      const displayName = c.name || 'amico';
      const lastChallenge = c.last_challenge_title || 'una sfida';
      const prompt = applyTemplate(promptTemplate, {
        first_name: displayName,
        last_challenge_title: lastChallenge,
        days_ago: c.days_since_last_open,
        total_count: c.total_challenges_completed,
        streak_count: c.streak,
      });

      const copy = await generatePersonalizedCopy(openai, prompt);
      if (!copy) {
        continue;
      }

      messages.push({
        to: c.push_token,
        sound: 'default',
        title: copy.title,
        body: copy.body,
        data: { type: 'personalized_nudge' },
      });

      logRows.push({
        user_id: c.user_id,
        type: 'personalized_nudge',
        title: copy.title,
        body: copy.body,
        ai_generated: true,
        data: { type: 'personalized_nudge' },
      });
    }

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, reason: 'no_valid_ai_copy' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const receipts = await sendExpoPushBatches(messages);

    const { error: logError } = await supabase
      .from('push_notification_log')
      .insert(logRows);

    if (logError) {
      throw new Error(`log insert error: ${logError.message}`);
    }

    return new Response(
      JSON.stringify({ sent: selected.length, receipts }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
