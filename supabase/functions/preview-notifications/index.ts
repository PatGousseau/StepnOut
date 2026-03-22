import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import OpenAI from 'https://esm.sh/openai@6.27.0';
import { corsHeaders } from '../_shared/cors.ts';
import { getPromptContent, applyTemplate } from '../_shared/prompts.ts';
import { truncate, pickRandom } from '../_shared/utils.ts';

type StreakCandidate = {
  user_id: string;
  push_token: string;
  challenge_id: number;
  challenge_title: string | null;
};

type NudgeCandidate = {
  user_id: string;
  push_token: string;
  name: string | null;
  last_challenge_title: string | null;
  days_since_last_open: number;
  total_challenges_completed: number;
  streak: number;
};

type HighlightRow = {
  post_id: number;
  title: string;
  body: string;
};

type HighlightCandidate = {
  user_id: string;
  push_token: string;
};

type Template = { title: string; body: string };

type PopularPostRow = { post_id: number };

type PostRow = {
  id: number;
  body: string | null;
  created_at: string;
  user_id: string;
  challenge_id: number | null;
};

function buildCommunityHighlightTitle(posterName: string) {
  return `Guarda cosa ha fatto ${posterName}`;
}

function parseTemplates(raw: string | null): Template[] {
  const fallback: Template[] = [
    { title: 'Serie a rischio', body: 'Ti restano 3 giorni per completare la sfida e salvare la tua serie.' },
  ];
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const valid = parsed.filter((item: Template) => item?.title && item?.body);
    return valid.length ? valid : fallback;
  } catch {
    return fallback;
  }
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

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

  const url = new URL(req.url);
  const maxNudges = Number(url.searchParams.get('maxNudges') || '3');

  const results: Record<string, unknown> = {};

  // --- Streak at risk ---
  try {
    const { data: streakCandidates, error } = await supabase.rpc('get_streak_at_risk_candidates');
    if (error) throw new Error(error.message);

    const candidates = (streakCandidates || []) as StreakCandidate[];
    const templateRaw = await getPromptContent(supabase, 'streak_at_risk_templates');
    const templates = parseTemplates(templateRaw);

    results.streak_at_risk = {
      candidates: candidates.length,
      notifications: candidates.map((c) => {
        const picked = pickRandom(templates);
        return {
          user_id: c.user_id,
          challenge_id: c.challenge_id,
          challenge_title: c.challenge_title,
          title: picked.title,
          body: picked.body,
        };
      }),
    };
  } catch (err) {
    results.streak_at_risk = { error: String(err) };
  }

  // --- Community highlight ---
  try {
    // Check for existing pre-generated highlight
    const { data: highlight, error: highlightError } = await supabase.rpc('get_latest_community_highlight');
    if (highlightError) throw new Error(highlightError.message);

    const existing = (highlight as HighlightRow[] | null)?.[0];

    if (existing) {
      const { data: hlCandidates, error: hlCandidatesError } = await supabase.rpc(
        'get_daily_highlight_candidates',
        { highlight_post_id: existing.post_id },
      );
      if (hlCandidatesError) throw new Error(hlCandidatesError.message);

      const candidates = (hlCandidates || []) as HighlightCandidate[];
      results.community_highlight = {
        source: 'pre_generated',
        post_id: existing.post_id,
        title: existing.title,
        body: existing.body,
        eligible_users: candidates.length,
      };
    } else if (openai) {
      // Try generating one on the fly for preview
      const { data: popularIds, error: popularError } = await supabase.rpc('get_popular_post_ids', {
        feed_type: 'challenge',
        blocked_ids: [],
        page_size: 20,
        page_offset: 0,
      });
      if (popularError) throw new Error(popularError.message);

      const ids = (popularIds || []).map((row: PopularPostRow) => row.post_id);
      let candidatePost: PostRow | null = null;

      if (ids.length > 0) {
        const { data: posts } = await supabase.from('post').select('id, body, created_at, user_id, challenge_id').in('id', ids);
        const { data: existingHighlights } = await supabase.from('community_highlights').select('post_id').in('post_id', ids);

        const existingSet = new Set((existingHighlights || []).map((row: { post_id: number }) => row.post_id));
        const postMap = new Map<number, PostRow>();
        (posts || []).forEach((post: PostRow) => postMap.set(post.id, post));

        const DEFAULT_POST_BODY = 'Ho appena completato la sfida settimanale!';
        const cutoff = Date.now() - 48 * 60 * 60 * 1000;
        for (const id of ids) {
          const post = postMap.get(id);
          if (!post) continue;
          if (existingSet.has(post.id)) continue;
          const createdAt = new Date(post.created_at).getTime();
          if (Number.isNaN(createdAt)) continue;
          if (createdAt < cutoff) continue;
          if (!post.body || post.body.trim() === DEFAULT_POST_BODY) continue;
          candidatePost = post;
          break;
        }
      }

      if (!candidatePost) {
        results.community_highlight = { source: 'none', reason: 'no_eligible_post' };
      } else {
        const [{ data: profile }, { data: challenge }] = await Promise.all([
          supabase.from('profiles').select('name, username').eq('id', candidatePost.user_id).maybeSingle(),
          candidatePost.challenge_id
            ? supabase.from('challenges').select('title, title_it').eq('id', candidatePost.challenge_id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        const posterName = profile?.name || profile?.username || 'qualcuno';
        const challengeTitle = challenge?.title_it || challenge?.title || 'una sfida';
        const postBody = truncate(candidatePost.body || '', 500);

        const template = await getPromptContent(supabase, 'community_highlight');
        if (!template) {
          results.community_highlight = { source: 'none', reason: 'missing_prompt_template' };
        } else {
          const prompt = applyTemplate(template, {
            poster_first_name: posterName,
            challenge_title: challengeTitle,
            post_body: postBody,
          });

          const response = await openai.responses.create({
            model: 'gpt-4.1-mini',
            temperature: 0.7,
            input: [
              { role: 'system', content: 'Sei un copywriter per notifiche push di un social app. Tono caldo, diretto, non sdolcinato. Nessun riferimento a AI o LLM.' },
              { role: 'user', content: prompt },
            ],
            text: {
              format: {
                type: 'json_schema',
                name: 'push_notification',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    body: { type: 'string', maxLength: 100 },
                  },
                  required: ['body'],
                  additionalProperties: false,
                },
              },
            },
          });

          let parsed: { body?: string } | null = null;
          try { parsed = JSON.parse(response.output_text || ''); } catch { parsed = null; }

          if (!parsed?.body) {
            results.community_highlight = { source: 'generated', reason: 'invalid_ai_output', post_id: candidatePost.id };
          } else {
            results.community_highlight = {
              source: 'generated',
              post_id: candidatePost.id,
              poster: posterName,
              challenge: challengeTitle,
              title: buildCommunityHighlightTitle(posterName),
              body: parsed.body,
            };
          }
        }
      }
    } else {
      results.community_highlight = { source: 'none', reason: 'no_pre_generated_highlight_and_no_openai_key' };
    }
  } catch (err) {
    results.community_highlight = { error: String(err) };
  }

  // --- Personalized nudge ---
  try {
    // Query candidates directly, skipping last_open_at filter (not yet populated)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, push_token, name')
      .not('push_token', 'is', null);
    if (error) throw new Error(error.message);

    const allCandidates: NudgeCandidate[] = [];
    for (const row of (profiles || [])) {
      // Count challenges completed via post table
      const { count } = await supabase
        .from('post')
        .select('challenge_id', { count: 'exact', head: true })
        .eq('user_id', row.id)
        .not('challenge_id', 'is', null);

      if (!count || count < 1) continue;

      // Get last challenge post
      const { data: lastPost } = await supabase
        .from('post')
        .select('challenge_id, challenges(title, title_it)')
        .eq('user_id', row.id)
        .not('challenge_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const ch = lastPost?.challenges as { title?: string; title_it?: string } | null;
      allCandidates.push({
        user_id: row.id,
        push_token: row.push_token,
        name: row.name,
        last_challenge_title: ch?.title_it || ch?.title || null,
        days_since_last_open: 5, // simulated for preview
        total_challenges_completed: count,
        streak: 0,
      });

      if (allCandidates.length >= maxNudges) break;
    }

    const selected = allCandidates.slice(0, maxNudges);

    if (selected.length === 0) {
      results.personalized_nudge = { candidates: 0, notifications: [] };
    } else if (!openai) {
      results.personalized_nudge = {
        candidates: allCandidates.length,
        reason: 'no_openai_key',
        would_notify: selected.map((c) => ({
          user_id: c.user_id,
          name: c.name,
          last_challenge: c.last_challenge_title,
          days_inactive: c.days_since_last_open,
        })),
      };
    } else {
      const promptTemplate = await getPromptContent(supabase, 'personalized_nudge');
      if (!promptTemplate) {
        results.personalized_nudge = { candidates: allCandidates.length, reason: 'missing_prompt_template' };
      } else {
        const notifications: Record<string, unknown>[] = [];
        for (const c of selected) {
          const prompt = applyTemplate(promptTemplate, {
            first_name: c.name || 'amico',
            last_challenge_title: c.last_challenge_title || 'una sfida',
            days_ago: c.days_since_last_open,
            total_count: c.total_challenges_completed,
            streak_count: c.streak,
          });

          const res = await openai.responses.create({
            model: 'gpt-4.1-mini',
            temperature: 0.8,
            input: [
              { role: 'system', content: 'Scrivi notifiche push brevi per una app social. Tono caldo, naturale, non giudicante. Nessun riferimento ad AI o LLM.' },
              { role: 'user', content: prompt },
            ],
            text: {
              format: {
                type: 'json_schema',
                name: 'push_notification',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', maxLength: 40 },
                    body: { type: 'string', maxLength: 100 },
                  },
                  required: ['title', 'body'],
                  additionalProperties: false,
                },
              },
            },
          });

          let parsed: { title?: string; body?: string } | null = null;
          try { parsed = JSON.parse(res.output_text || ''); } catch { parsed = null; }

          notifications.push({
            user_id: c.user_id,
            name: c.name,
            days_inactive: c.days_since_last_open,
            last_challenge: c.last_challenge_title,
            title: parsed?.title || null,
            body: parsed?.body || null,
            ai_failed: !parsed?.title || !parsed?.body,
          });
        }

        results.personalized_nudge = {
          total_candidates: allCandidates.length,
          previewed: selected.length,
          notifications,
        };
      }
    }
  } catch (err) {
    results.personalized_nudge = { error: String(err) };
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
