import OpenAI from 'https://esm.sh/openai@6.27.0';
import { corsHeaders } from '../_shared/cors.ts';

type ReqBody = {
  challengeTitle?: string;
  challengeDescription?: string;
  challengeTitleIt?: string;
  challengeDescriptionIt?: string;
};

const FIXED_TITLE_IT = 'Ancora 2 giorni!';
const FIXED_TITLE_EN = '2 days left!';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'missing OPENAI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json().catch(() => ({}))) as ReqBody;
    const challengeTitle = (body.challengeTitle || '').trim();
    const challengeDescription = (body.challengeDescription || '').trim();
    const challengeTitleIt = (body.challengeTitleIt || challengeTitle).trim();
    const challengeDescriptionIt = (body.challengeDescriptionIt || challengeDescription).trim();

    if (!challengeTitle && !challengeTitleIt) {
      return new Response(JSON.stringify({ error: 'missing challenge title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const [itResp, enResp] = await Promise.all([
      openai.responses.create({
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        input: [
          {
            role: 'system',
            content:
              'Scrivi copy di notifiche push in italiano per un’app social di sfide. Mantieni il testo breve, energico, naturale e action-oriented. Nessuna emoji obbligatoria. Nessun riferimento ad AI.',
          },
          {
            role: 'user',
            content:
              `Genera SOLO il body (max 100 caratteri) per una notifica push di reminder: mancano 2 giorni alla fine della sfida.\n` +
              `Titolo sfida: ${challengeTitleIt || challengeTitle}\n` +
              `Descrizione sfida: ${challengeDescriptionIt || challengeDescription}`,
          },
        ],
      }),
      openai.responses.create({
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        input: [
          {
            role: 'system',
            content:
              'Write push notification copy in English for a social challenge app. Keep it short, motivating, natural, and action-oriented. No AI mentions.',
          },
          {
            role: 'user',
            content:
              `Generate ONLY the body (max 100 chars) for a push reminder: 2 days left to complete the challenge.\n` +
              `Challenge title: ${challengeTitle || challengeTitleIt}\n` +
              `Challenge description: ${challengeDescription || challengeDescriptionIt}`,
          },
        ],
      }),
    ]);

    const italianBody = (itResp.output_text || '').trim().slice(0, 100);
    const englishBody = (enResp.output_text || '').trim().slice(0, 100);

    return new Response(
      JSON.stringify({
        italianTitle: FIXED_TITLE_IT,
        italianBody,
        englishTitle: FIXED_TITLE_EN,
        englishBody,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('generate-2day-notification error:', error);
    return new Response(JSON.stringify({ error: 'failed to generate notification' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
