/// <reference types="https://deno.land/x/supabase_functions@1.3.3/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from '../_shared/cors.ts';
import { sendExpoPushBatches, PushMessage } from '../_shared/notifications.ts';

type HighlightRow = {
  post_id: number;
  title: string;
  body: string;
};

type CandidateRow = {
  user_id: string;
  push_token: string;
};

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
    const { data: highlight, error: highlightError } = await supabase.rpc(
      'get_latest_community_highlight',
    );

    if (highlightError) {
      throw new Error(`highlight rpc error: ${highlightError.message}`);
    }

    const row = (highlight as HighlightRow[] | null)?.[0];
    if (!row) {
      return new Response(
        JSON.stringify({ sent: 0, reason: 'no_highlight' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: candidates, error: candidatesError } = await supabase.rpc(
      'get_daily_highlight_candidates',
      { highlight_post_id: row.post_id },
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

    const messages: PushMessage[] = selected.map((c) => ({
      to: c.push_token,
      sound: 'default',
      title: row.title,
      body: row.body,
      data: { type: 'community_highlight', post_id: row.post_id },
    }));

    const receipts = await sendExpoPushBatches(messages);

    const logRows = selected.map((c) => ({
      user_id: c.user_id,
      type: 'community_highlight',
      title: row.title,
      body: row.body,
      post_id: row.post_id,
      ai_generated: true,
      data: { type: 'community_highlight', post_id: row.post_id },
    }));

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
