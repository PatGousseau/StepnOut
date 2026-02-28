/// <reference types="https://deno.land/x/supabase_functions@1.3.3/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import OpenAI from 'https://esm.sh/openai@4.86.1';
import { corsHeaders } from '../_shared/cors.ts';

type Candidate = {
  user_id: string;
  push_token: string;
  username: string | null;
  name: string | null;
  post_count: number;
  comment_count: number;
  last_post_body: string | null;
  last_comment_body: string | null;
  last_activity_at: string | null;
};

type PushMessage = {
  to: string;
  sound?: 'default';
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

function truncate(s: string, maxLen: number) {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1).trimEnd() + '…';
}

function pickInactiveCopy() {
  const options = [
    {
      title: 'quick challenge?',
      body: 'pick today\'s challenge and post your first step out. you\'ll feel better after.',
    },
    {
      title: 'your first post',
      body: 'drop one thing you did today that was slightly out of your comfort zone.',
    },
    {
      title: 'you\'re up',
      body: 'say hi in the feed or comment on someone\'s post — easy start.',
    },
  ];

  return options[Math.floor(Math.random() * options.length)];
}

async function generatePersonalizedCopy(openai: OpenAI, c: Candidate) {
  const displayName = c.name || c.username || 'there';

  const activityBits: string[] = [];
  if (c.last_post_body) activityBits.push(`last post: ${truncate(c.last_post_body, 220)}`);
  if (c.last_comment_body) activityBits.push(`last comment: ${truncate(c.last_comment_body, 220)}`);
  const activity = activityBits.join('\n');

  const prompt = [
    `user display name: ${displayName}`,
    `post_count: ${c.post_count}`,
    `comment_count: ${c.comment_count}`,
    activity ? `recent activity:\n${activity}` : 'recent activity: (none provided)',
  ].join('\n');

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content:
          'you write push notifications for a social app called "stepping out". be warm, slightly playful, non-cringe. keep it short and specific. no hashtags. no emojis.',
      },
      {
        role: 'user',
        content:
          `based on the user\'s recent activity, write a personalized push notification that gets them to open the app today.\n\nreturn strict json with keys: title, body.\nconstraints:\n- title <= 40 chars\n- body <= 140 chars\n- do not mention "ai" or "llm"\n\n${prompt}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const text = res.choices[0]?.message?.content;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    if (!parsed?.title || !parsed?.body) return null;

    return {
      title: truncate(String(parsed.title), 40),
      body: truncate(String(parsed.body), 140),
    };
  } catch {
    return null;
  }
}

async function sendExpoPush(messages: PushMessage[]) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`expo push failed: ${res.status} ${text}`);
  }

  return await res.json();
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

  const { data: candidates, error } = await supabase.rpc('get_daily_notification_candidates');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rows = (candidates || []) as Candidate[];

  const maxUsers = Number(new URL(req.url).searchParams.get('maxUsers') || '0');
  const selected = maxUsers > 0 ? rows.slice(0, maxUsers) : rows;

  const pushMessages: PushMessage[] = [];

  for (const c of selected) {
    const inactive = (c.post_count || 0) + (c.comment_count || 0) === 0;

    let title: string;
    let body: string;

    if (inactive) {
      ({ title, body } = pickInactiveCopy());
    } else {
      const personalized = await generatePersonalizedCopy(openai, c);
      if (!personalized) {
        ({ title, body } = pickInactiveCopy());
      } else {
        ({ title, body } = personalized);
      }
    }

    pushMessages.push({
      to: c.push_token,
      sound: 'default',
      title,
      body,
      data: { type: 'daily_personalized' },
    });
  }

  const batchSize = 100;
  const receipts: unknown[] = [];

  for (let i = 0; i < pushMessages.length; i += batchSize) {
    const batch = pushMessages.slice(i, i + batchSize);
    const receipt = await sendExpoPush(batch);
    receipts.push(receipt);
  }

  return new Response(
    JSON.stringify({ sent: pushMessages.length, receipts }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
