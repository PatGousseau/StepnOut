import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { sendExpoPushBatches, PushMessage } from '../_shared/notifications.ts';
import { getPromptContent } from '../_shared/prompts.ts';
import { pickRandom } from '../_shared/utils.ts';

type CandidateRow = {
  user_id: string;
  push_token: string;
  challenge_id: number;
  challenge_title: string | null;
};

type Template = { title: string; body: string };

const FALLBACK_TEMPLATES: Template[] = [
  {
    title: 'Non perdere la serie',
    body: 'Mancano 3 giorni alla sfida: se la salti perdi la tua serie. Ci sei?',
  },
  {
    title: 'Serie a rischio',
    body: 'Ti restano 3 giorni per completare la sfida e salvare la tua serie.',
  },
  {
    title: 'Ultimo avviso',
    body: 'Ancora 3 giorni: fai la sfida di oggi e tieni viva la tua serie.',
  },
];

function parseTemplates(raw: string | null): Template[] {
  if (!raw) return FALLBACK_TEMPLATES;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!Array.isArray(parsed)) return FALLBACK_TEMPLATES;
  const valid = parsed.filter((item) => item?.title && item?.body);
  return valid.length ? valid : FALLBACK_TEMPLATES;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: 'missing supabase env' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const url = new URL(req.url);
    const isDryRun = url.searchParams.get('dryRun') === '1';

    const { data: candidates, error: candidatesError } = await supabase.rpc(
      'get_streak_at_risk_candidates',
    );

    if (candidatesError) {
      throw new Error(`candidates rpc error: ${candidatesError.message}`);
    }

    const maxUsers = Number(url.searchParams.get('maxUsers') || '0');
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

    const templateRaw = await getPromptContent(
      supabase,
      'streak_at_risk_templates',
    );
    const templates = parseTemplates(templateRaw);

    const messages: PushMessage[] = [];
    const logRows: Record<string, unknown>[] = [];

    for (const c of selected) {
      const picked = pickRandom(templates);
      const title = picked.title;
      const body = picked.body;

      messages.push({
        to: c.push_token,
        sound: 'default',
        title,
        body,
        data: { type: 'streak_at_risk', challenge_id: c.challenge_id },
      });

      logRows.push({
        user_id: c.user_id,
        type: 'streak_at_risk',
        title,
        body,
        challenge_id: c.challenge_id,
        ai_generated: false,
        data: { type: 'streak_at_risk', challenge_id: c.challenge_id },
      });
    }

    if (isDryRun) {
      return new Response(
        JSON.stringify({
          sent: 0,
          dryRun: true,
          candidates: selected.length,
          messages,
        }),
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
