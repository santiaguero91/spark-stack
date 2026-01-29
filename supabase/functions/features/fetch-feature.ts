// fetch-features.ts
// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabase } from "../client.ts";

export async function fetchFeatures(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const submission_id = url.searchParams.get("submission_id");

    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: "submission_id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { data, error } = await supabase
      .from("requirements")
      .select(
        `
        id,
        proposal_id,
        submission_id,
        feature_name,
        description,
        purpose,
        integration_text,
        tech_constraints,
        created_at
      `,
      )
      .eq("submission_id", submission_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[fetch-features] Supabase error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch features" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(data ?? []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[fetch-features] Unexpected error:", err);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
