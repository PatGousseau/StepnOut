import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return respond({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return respond({ error: "missing_server_configuration" }, 500);
  }
  if (!authorization) return respond({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data: authData, error: authError } = await userClient.auth.getUser(
    token,
  );
  if (authError || !authData.user) {
    return respond({ error: "unauthorized" }, 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body?.user_id && body.user_id !== authData.user.id) {
      return respond({ error: "forbidden" }, 403);
    }

    const service = createClient(supabaseUrl, serviceRoleKey);
    const paths: string[] = [];
    for (let offset = 0;; offset += 100) {
      const { data: objects, error: listError } = await service.storage
        .from("growth-journal-audio")
        .list(authData.user.id, { limit: 100, offset });
      if (listError) throw listError;
      paths.push(
        ...(objects || []).map((object) =>
          `${authData.user.id}/${object.name}`
        ),
      );
      if (!objects || objects.length < 100) break;
    }
    if (paths.length > 0) {
      const { error: removeError } = await service.storage
        .from("growth-journal-audio")
        .remove(paths);
      if (removeError) throw removeError;
    }

    const { error: deleteError } = await userClient.rpc("delete_user");
    if (deleteError) throw deleteError;
    return respond({ deleted: true });
  } catch (error) {
    console.error("delete-account failed:", error);
    return respond({ error: "account_deletion_failed" }, 500);
  }
});
