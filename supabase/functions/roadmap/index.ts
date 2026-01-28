// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PROJECTS_QUERY } from "./query.ts";

// Linear API endpoint
const LINEAR_GRAPHQL = "https://api.linear.app/graphql";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_SECRET_KEY")!,
);

Deno.serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const initiativeId = searchParams.get("initiativeId");

    if (!initiativeId) {
      return new Response(JSON.stringify({ error: "initiativeId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch data from Linear
    const res = await fetch(LINEAR_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${Deno.env.get("LINEAR_API_KEY")}`,
      },
      body: JSON.stringify({
        query: PROJECTS_QUERY,
        variables: { initiativeId },
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Linear API Error]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
