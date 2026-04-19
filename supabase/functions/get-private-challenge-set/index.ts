import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

type Language = "en" | "it";
type Difficulty = "easy" | "medium" | "hard";

type ChallengeProfile = {
  goal: string;
  hard_situation: string;
  stretch_level: string;
  preferred_context: string;
  meaningful_type: string;
  avoid_types: string[];
  progress_definition: string;
};

type ChallengeRow = {
  difficulty: Difficulty;
  title: string;
  description: string;
  why_this_matters: string;
  coaching_tip: string | null;
  theme: string | null;
};

const LABELS: Record<Language, Record<string, string>> = {
  en: {
    confidence: "confidence",
    connection: "connection",
    spontaneity: "spontaneity",
    courage: "courage",
    self_trust: "self-trust",
    less_overthinking: "less overthinking",
    talking_to_strangers: "talking to strangers",
    being_seen: "being seen",
    asking_for_what_i_want: "asking for what you want",
    doing_things_alone: "doing things alone",
    being_playful: "being playful",
    saying_yes: "saying yes to unfamiliar things",
    gentle: "gentle",
    balanced: "balanced",
    push_me: "push me",
    at_home: "at home",
    outside: "outside",
    social_settings: "social settings",
    work_or_school: "work or school",
    anywhere: "anywhere",
    social: "social",
    reflective: "reflective",
    adventurous: "adventurous",
    expressive: "expressive",
    practical: "practical",
    habit_building: "habit-building",
    spending_money: "spending money",
    group_social_situations: "group social situations",
    physically_demanding: "physically demanding activities",
    nighttime: "nighttime activities",
    less_anxious: "feeling less anxious",
    more_initiative: "taking more initiative",
    talk_to_more_people: "talking to more people",
    less_overthinking_action: "doing things without overthinking",
    more_stories: "having more stories and memories",
  },
  it: {
    confidence: "sicurezza",
    connection: "connessione",
    spontaneity: "spontaneità",
    courage: "coraggio",
    self_trust: "fiducia in sé",
    less_overthinking: "meno overthinking",
    talking_to_strangers: "parlare con sconosciuti",
    being_seen: "mettersi in mostra",
    asking_for_what_i_want: "chiedere ciò che vuoi",
    doing_things_alone: "fare cose da soli",
    being_playful: "essere giocosi",
    saying_yes: "dire sì a cose nuove",
    gentle: "delicato",
    balanced: "equilibrato",
    push_me: "spingimi",
    at_home: "a casa",
    outside: "fuori",
    social_settings: "contesti sociali",
    work_or_school: "lavoro o scuola",
    anywhere: "ovunque",
    social: "sociale",
    reflective: "riflessivo",
    adventurous: "avventuroso",
    expressive: "espressivo",
    practical: "pratico",
    habit_building: "piccola abitudine",
    spending_money: "spendere soldi",
    group_social_situations: "situazioni di gruppo",
    physically_demanding: "attività fisicamente impegnative",
    nighttime: "attività notturne",
    less_anxious: "sentirsi meno ansiosi",
    more_initiative: "avere più iniziativa",
    talk_to_more_people: "parlare con più persone",
    less_overthinking_action: "agire senza pensarci troppo",
    more_stories: "avere più storie e ricordi",
  },
};

function getLabel(language: Language, key: string) {
  return LABELS[language][key] || key;
}

function fallbackChallenges(profile: ChallengeProfile, language: Language): ChallengeRow[] {
  const goal = getLabel(language, profile.goal);
  const context = getLabel(language, profile.preferred_context);
  const hardSituation = getLabel(language, profile.hard_situation);
  const meaningfulType = getLabel(language, profile.meaningful_type);

  if (language === "it") {
    return [
      {
        difficulty: "easy",
        title: "Un piccolo passo oggi",
        description: `Fai una piccola azione in ${context} che ti avvicini a più ${goal}.`,
        why_this_matters: `Le sfide più piccole aiutano a creare continuità senza alzare troppo la pressione.`,
        coaching_tip: "Tienila semplice: conta anche un gesto di due minuti.",
        theme: meaningfulType,
      },
      {
        difficulty: "medium",
        title: "Scegli l'attrito giusto",
        description: `Affronta un momento che di solito eviti quando si tratta di ${hardSituation}.`,
        why_this_matters: `La crescita arriva quando fai una scelta leggermente scomoda ma gestibile.`,
        coaching_tip: "Non puntare alla performance. Punta al gesto concreto.",
        theme: meaningfulType,
      },
      {
        difficulty: "hard",
        title: "Una scelta più coraggiosa",
        description: `Fai oggi un'azione visibile e intenzionale che ti faccia sentire un po' più audace del solito.`,
        why_this_matters: `Le prove più coraggiose cambiano il modo in cui inizi a vederti.`,
        coaching_tip: "Fai un respiro, scegli un momento preciso, poi esegui senza rimandare.",
        theme: meaningfulType,
      },
    ];
  }

  return [
    {
      difficulty: "easy",
      title: "One small step today",
      description: `Do one small action in ${context} that nudges you toward more ${goal}.`,
      why_this_matters: "Small wins build consistency without making the challenge feel heavy.",
      coaching_tip: "Keep it tiny. A two-minute action still counts.",
      theme: meaningfulType,
    },
    {
      difficulty: "medium",
      title: "Choose the right friction",
      description: `Take on one moment you usually avoid when it comes to ${hardSituation}.`,
      why_this_matters: "Growth usually comes from a stretch that feels real but still manageable.",
      coaching_tip: "Do not aim for a perfect performance. Aim for a concrete action.",
      theme: meaningfulType,
    },
    {
      difficulty: "hard",
      title: "Make a bolder move",
      description: "Take one visible, deliberate action today that feels braver than your usual default.",
      why_this_matters: "Bolder reps change how you see yourself, not just what you did once.",
      coaching_tip: "Pick the exact moment first, then follow through before your brain bargains.",
      theme: meaningfulType,
    },
  ];
}

function parseChallengePayload(text: string | null): ChallengeRow[] | null {
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { challenges?: ChallengeRow[] };
    const challenges = parsed.challenges || [];
    const difficulties = challenges.map((challenge) => challenge.difficulty);
    const valid = ["easy", "medium", "hard"].every((difficulty) => difficulties.includes(difficulty as Difficulty));

    if (!valid || challenges.length !== 3) {
      return null;
    }

    return challenges.map((challenge) => ({
      difficulty: challenge.difficulty,
      title: challenge.title.trim(),
      description: challenge.description.trim(),
      why_this_matters: challenge.why_this_matters.trim(),
      coaching_tip: challenge.coaching_tip?.trim() || null,
      theme: challenge.theme?.trim() || null,
    }));
  } catch {
    return null;
  }
}

async function generateWithOpenAI(
  openaiApiKey: string,
  language: Language,
  profile: ChallengeProfile,
  recentSets: Array<{
    challenge_date: string;
    completed_difficulty: string | null;
    status: string;
    private_challenges?: Array<{ difficulty: string; title: string; theme: string | null }>;
  }>
): Promise<ChallengeRow[] | null> {
  const avoidTypes = (profile.avoid_types || []).map((value: string) => getLabel(language, value));
  const recentHistory = (recentSets || []).map((set) => ({
    challenge_date: set.challenge_date,
    status: set.status,
    completed_difficulty: set.completed_difficulty,
    challenges: (set.private_challenges || []).map((challenge) => ({
      difficulty: challenge.difficulty,
      title: challenge.title,
      theme: challenge.theme,
    })),
  }));

  const systemPrompt =
    language === "it"
      ? "Scrivi tre sfide private giornaliere per una app sulla comfort zone. Tono umano, concreto, incoraggiante ma non sdolcinato. Nessun riferimento ad AI. Ogni sfida deve essere fattibile in un giorno, sicura, specifica e diversa dalle sfide recenti. Non proporre mai attività di ripresa, pubblicazione pubblica o creazione contenuti."
      : "Write three private daily challenges for a comfort-zone app. Keep the tone human, concrete, and encouraging without sounding cheesy. Never mention AI. Every challenge must be safe, specific, finishable in one day, and different from recent challenges. Never include filming, public posting, or content creation tasks.";

  const userPrompt = JSON.stringify({
    profile: {
      goal: getLabel(language, profile.goal),
      hard_situation: getLabel(language, profile.hard_situation),
      stretch_level: getLabel(language, profile.stretch_level),
      preferred_context: getLabel(language, profile.preferred_context),
      meaningful_type: getLabel(language, profile.meaningful_type),
      avoid_types: avoidTypes,
      progress_definition: getLabel(language, profile.progress_definition),
    },
    recent_history: recentHistory,
    output_rules: {
      language,
      create_one_each_for: ["easy", "medium", "hard"],
      the_three_should_feel_related: true,
      short_title: true,
      include_fields: ["difficulty", "title", "description", "why_this_matters", "coaching_tip", "theme"],
    },
  });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.9,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "private_challenge_set",
          strict: true,
          schema: {
            type: "object",
            properties: {
              challenges: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    title: { type: "string", maxLength: 80 },
                    description: { type: "string", maxLength: 220 },
                    why_this_matters: { type: "string", maxLength: 180 },
                    coaching_tip: { type: "string", maxLength: 160 },
                    theme: { type: "string", maxLength: 60 },
                  },
                  required: [
                    "difficulty",
                    "title",
                    "description",
                    "why_this_matters",
                    "coaching_tip",
                    "theme",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["challenges"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`openai error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return parseChallengePayload(data.output_text || null);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: "missing supabase env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const localDate = typeof body?.localDate === "string" ? body.localDate : "";
    const language: Language = body?.language === "it" ? "it" : "en";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      return new Response(JSON.stringify({ error: "invalid date" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    const { data: existingSet, error: existingError } = await adminClient
      .from("private_challenge_sets")
      .select("*, private_challenges(*)")
      .eq("user_id", userId)
      .eq("challenge_date", localDate)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingSet) {
      return new Response(JSON.stringify(existingSet), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profileError } = await adminClient
      .from("private_challenge_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: "missing profile" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: recentSets, error: historyError } = await adminClient
      .from("private_challenge_sets")
      .select("challenge_date, completed_difficulty, status, private_challenges(difficulty, title, theme)")
      .eq("user_id", userId)
      .order("challenge_date", { ascending: false })
      .limit(20);

    if (historyError) {
      throw new Error(historyError.message);
    }

    let generatedChallenges = fallbackChallenges(profile as ChallengeProfile, language);

    if (openaiApiKey) {
      const parsed = await generateWithOpenAI(
        openaiApiKey,
        language,
        profile as ChallengeProfile,
        (recentSets || []) as Array<{
          challenge_date: string;
          completed_difficulty: string | null;
          status: string;
          private_challenges?: Array<{ difficulty: string; title: string; theme: string | null }>;
        }>
      );
      if (parsed) {
        generatedChallenges = parsed;
      }
    }

    const { data: createdSet, error: setInsertError } = await adminClient
      .from("private_challenge_sets")
      .insert({
        user_id: userId,
        challenge_date: localDate,
        status: "pending",
      })
      .select("*")
      .single();

    if (setInsertError) {
      if (setInsertError.code === "23505") {
        const { data: racedSet, error: racedError } = await adminClient
          .from("private_challenge_sets")
          .select("*, private_challenges(*)")
          .eq("user_id", userId)
          .eq("challenge_date", localDate)
          .single();

        if (racedError) {
          throw new Error(racedError.message);
        }

        return new Response(JSON.stringify(racedSet), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(setInsertError.message);
    }

    const { error: challengeInsertError } = await adminClient
      .from("private_challenges")
      .insert(
        generatedChallenges.map((challenge) => ({
          set_id: createdSet.id,
          difficulty: challenge.difficulty,
          title: challenge.title,
          description: challenge.description,
          why_this_matters: challenge.why_this_matters,
          coaching_tip: challenge.coaching_tip,
          theme: challenge.theme,
          llm_metadata: {
            source: openaiApiKey ? "openai_or_fallback" : "fallback",
            language,
          },
        }))
      );

    if (challengeInsertError) {
      throw new Error(challengeInsertError.message);
    }

    const { data: hydratedSet, error: hydratedError } = await adminClient
      .from("private_challenge_sets")
      .select("*, private_challenges(*)")
      .eq("id", createdSet.id)
      .single();

    if (hydratedError) {
      throw new Error(hydratedError.message);
    }

    return new Response(JSON.stringify(hydratedSet), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
