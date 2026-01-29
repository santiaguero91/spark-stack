// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { redis } from "../lib/redis.ts";
import { PROJECTS_QUERY } from "./query.ts";

const LINEAR_GRAPHQL = "https://api.linear.app/graphql";

async function fetchFromLinear(initiativeId: string) {
  const res = await fetch(LINEAR_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Deno.env.get("LINEAR_API_KEY")}`,
    },
    body: JSON.stringify({
      query: PROJECTS_QUERY,
      variables: { initiativeId },
    }),
  });

  const data = await res.json();
  return data;
}

Deno.serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const initiativeId = searchParams.get("initiativeId");

    if (!initiativeId) {
      return new Response(
        JSON.stringify({ error: "initiativeId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const cacheKey = `roadmap:${initiativeId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Cached raw:", cached);
      fetchFromLinear(initiativeId)
        .then((freshData) =>
          redis.set(cacheKey, JSON.stringify(freshData), { ex: 300 }),
        )
        .catch((err) => console.error("Failed to refresh cache", err));

      return new Response(
        JSON.stringify(cached.data?.initiative || cached),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await fetchFromLinear(initiativeId);
    console.log("No-Cache", data);

    await redis.set(cacheKey, JSON.stringify(data), { ex: 300 });

    return new Response(JSON.stringify(data.data?.initiative), {
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
