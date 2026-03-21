import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: unknown) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

type GenerateRequest = {
  challengeTitle?: string;
  challengeDescription?: string;
  challengeTitleIt?: string;
  challengeDescriptionIt?: string;
};

type GenerateResponse = {
  italianBody: string;
  englishBody: string;
};

const systemPrompt = `you write short, high-signal push notification copy for a weekly challenge app.

requirements:
- output must be valid json
- italianBody: italian, 1-2 sentences max, ~160 chars or less when possible
- englishBody: faithful english translation, also 1-2 sentences
- no hashtags
- no quotes
- should reference the *current challenge* specifically (not generic motivation)
- tone: warm, a little bold, not cringe
- if details are missing, ask the user to take one concrete action that fits the challenge`;

const buildUserPrompt = (r: GenerateRequest) => {
  const title = r.challengeTitleIt?.trim() || r.challengeTitle?.trim() || '';
  const description = r.challengeDescriptionIt?.trim() || r.challengeDescription?.trim() || '';

  return `current active challenge\n\n` +
    `title: ${title || '(unknown)'}\n` +
    `description: ${description || '(unknown)'}\n\n` +
    `write the 2-days-left reminder body.`;
};

const openAi = async (apiKey: string, req: GenerateRequest): Promise<GenerateResponse> => {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserPrompt(req) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'two_day_notification',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              italianBody: { type: 'string' },
              englishBody: { type: 'string' },
            },
            required: ['italianBody', 'englishBody'],
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`openai error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const text = data.output_text;
  const parsed = JSON.parse(text);

  return {
    italianBody: String(parsed.italianBody || ''),
    englishBody: String(parsed.englishBody || ''),
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return json(500, { error: 'missing supabase env' });
    }

    if (!openAiKey) {
      return json(500, { error: 'missing openai api key' });
    }

    const authHeader = req.headers.get('Authorization') || '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return json(401, { error: 'unauthorized' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return json(403, { error: 'forbidden' });
    }

    const body = (await req.json().catch(() => null)) as GenerateRequest | null;
    if (!body) {
      return json(400, { error: 'missing body' });
    }

    const generated = await openAi(openAiKey, body);

    return json(200, generated);
  } catch (e) {
    console.error('generate-2day-notification error:', e);
    return json(500, { error: 'failed to generate notification' });
  }
});
