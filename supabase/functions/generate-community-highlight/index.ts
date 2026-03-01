/// <reference types="https://deno.land/x/supabase_functions@1.3.3/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import OpenAI from 'https://esm.sh/openai@4.86.1';
import { corsHeaders } from '../_shared/cors.ts';
import { getPromptContent, applyTemplate } from '../_shared/prompts.ts';
import { truncate } from '../_shared/utils.ts';

type PopularPostRow = { post_id: number };

type PostRow = {
  id: number;
  body: string | null;
  created_at: string;
  user_id: string;
  challenge_id: number | null;
};

async function getTopPostCandidate(
  supabase: ReturnType<typeof createClient>,
): Promise<PostRow | null> {
  const { data: popularIds, error: popularError } = await supabase.rpc(
    'get_popular_post_ids',
    {
      feed_type: 'challenge',
      blocked_ids: [],
      page_size: 20,
      page_offset: 0,
    },
  );

  if (popularError) {
    throw new Error(`popular rpc error: ${popularError.message}`);
  }

  const ids = (popularIds || []).map((row: PopularPostRow) => row.post_id);
  if (ids.length === 0) return null;

  const { data: posts, error: postsError } = await supabase
    .from('post')
    .select('id, body, created_at, user_id, challenge_id')
    .in('id', ids);

  if (postsError) {
    throw new Error(`posts fetch error: ${postsError.message}`);
  }

  const { data: existing, error: existingError } = await supabase
    .from('community_highlights')
    .select('post_id')
    .in('post_id', ids);

  if (existingError) {
    throw new Error(`highlights fetch error: ${existingError.message}`);
  }

  const existingSet = new Set((existing || []).map((row) => row.post_id));
  const postMap = new Map<number, PostRow>();
  (posts || []).forEach((post: PostRow) => postMap.set(post.id, post));

  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  for (const id of ids) {
    const post = postMap.get(id);
    if (!post) continue;
    if (existingSet.has(post.id)) continue;
    const createdAt = new Date(post.created_at).getTime();
    if (Number.isNaN(createdAt)) continue;
    if (createdAt < cutoff) continue;
    return post;
  }

  return null;
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
    const url = new URL(req.url);
    const isDryRun = url.searchParams.get('dryRun') === '1';

    const candidate = await getTopPostCandidate(supabase);
    if (!candidate) {
      return new Response(
        JSON.stringify({ status: 'no_eligible_post' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const [{ data: profile }, { data: challenge }] = await Promise.all([
      supabase
        .from('profiles')
        .select('name, username')
        .eq('id', candidate.user_id)
        .maybeSingle(),
      candidate.challenge_id
        ? supabase
            .from('challenges')
            .select('title, title_it')
            .eq('id', candidate.challenge_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const posterName = profile?.name || profile?.username || 'qualcuno';
    const challengeTitle = challenge?.title_it || challenge?.title || 'una sfida';
    const postBody = truncate(candidate.body || '', 500);

    const template =
      (await getPromptContent(supabase, 'community_highlight')) || '';

    if (!template) {
      return new Response(
        JSON.stringify({ status: 'missing_prompt_template' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const prompt = applyTemplate(template, {
      poster_first_name: posterName,
      challenge_title: challengeTitle,
      post_body: postBody,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'Sei un copywriter per notifiche push di un social app. Tono caldo, diretto, non sdolcinato. Nessun riferimento a AI o LLM.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '';
    let parsed: { title?: string; body?: string } | null = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }

    if (!parsed?.title || !parsed?.body) {
      return new Response(
        JSON.stringify({ status: 'invalid_ai_output' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const title = truncate(String(parsed.title), 40);
    const body = truncate(String(parsed.body), 100);

    if (!isDryRun) {
      const { error: insertError } = await supabase
        .from('community_highlights')
        .upsert(
          {
            post_id: candidate.id,
            title,
            body,
          },
          { onConflict: 'post_id', ignoreDuplicates: true },
        );

      if (insertError) {
        throw new Error(`highlight insert error: ${insertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        status: isDryRun ? 'dry_run' : 'generated',
        post_id: candidate.id,
        title,
        body,
      }),
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
