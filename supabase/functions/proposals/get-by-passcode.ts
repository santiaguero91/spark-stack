// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabase } from "../client.ts";

export async function getByPasscode(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const passcode = url.searchParams.get("passcode");
    console.log("PASSCODE", passcode);

    if (!passcode) {
      return new Response(
        JSON.stringify({ error: "Missing passcode parameter" }),
        { status: 400 },
      );
    }

    const { data: proposal, error } = await supabase
      .from("proposals")
      .select(
        `
        proposal_id,
        lead_id,
        creator_email,
        passcode,
        stage,
        total_duration,
        why_this_stack,
        created_at,
        updated_at,
        signed_at,
        scopes,
        deliverables,
        dependencies,
        payment_milestones,
        cost_breakdown,
        assumptions,
        team,
        stack_section,
        summary_items,
        milestones,
        sections,
        initial_total_investment,
        lead:lead_id (
          description,
          formatted_date,
          estimateTime_min,
          estimateTime_max,
          budget_min,
          budget_max
        )
      `,
      )
      .eq("passcode", passcode)
      .maybeSingle();

    if (error) {
      console.error("[GET /proposals] Supabase error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }

    if (!proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ data: proposal }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[GET /proposals] Unexpected error:", err);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
