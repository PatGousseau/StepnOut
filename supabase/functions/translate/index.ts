// supabase edge function: translate
// - it-to-en: authenticated users can translate italian -> english
// - en-to-it: admin-only; translates english -> italian (natural + colloquial)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Direction = "it-to-en" | "en-to-it";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { text, direction } = (await req.json()) as { text?: string; direction?: Direction };

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ translatedText: "" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dir: Direction = direction === "en-to-it" ? "en-to-it" : "it-to-en";

    if (dir === "en-to-it") {
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
      if (adminError) {
        return new Response(JSON.stringify({ error: "Admin check failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = Deno.env.get("OPENAI_TRANSLATE_MODEL") || "gpt-4o-mini";

    const system =
      dir === "en-to-it"
        ? "You translate English to Italian. Output only the translation. Make it sound natural, casual, and colloquial (native Italian), while preserving meaning and tone. Do not add explanations."
        : "You translate Italian to English. Output only the translation. Keep it natural and readable. Do not add explanations.";

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content:
              dir === "en-to-it"
                ? `Translate this message to Italian (natural/colloquial):\n\n${text}`
                : `Translate this message to English:\n\n${text}`,
          },
        ],
        temperature: dir === "en-to-it" ? 0.4 : 0.2,
      }),
    );

    if (!resp.ok) {
      const body = await resp.text();
      return new Response(JSON.stringify({ error: "OpenAI error", detail: body }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const json = await resp.json();
    const translatedText = json?.choices?.[0]?.message?.content?.trim?.() || "";

    return new Response(JSON.stringify({ translatedText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
