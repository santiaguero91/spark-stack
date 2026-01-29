// create-requirements.ts
// @ts-nocheck
import { supabase } from "../client.ts";
import { CreateRequirementsSchema } from "./zod.js";

export async function createRequirements(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    // ✅ Validate request body
    const parsed = CreateRequirementsSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const {
      proposal_id,
      submission_id,
      features,
      discovery_state,
      estimateTime_min,
      estimateTime_max,
      budget_min,
      budget_max,
      description,
      lead_id,
    } = parsed.data;

    /* -----------------------------
       Insert requirements
    ------------------------------ */
    const { error: insertError, count } = await supabase
      .from("requirements")
      .insert(
        features.map((item) => ({
          proposal_id,
          submission_id,
          feature_name: item.title ?? null,
          integration_text: item.integrations ?? null,
          description: item.description ?? null,
          purpose: item.purpose ?? null,
          tech_constraints: item.tech_constraints ?? null,
        })),
        { count: "exact" },
      );

    if (insertError) {
      console.error("[createRequirements] Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create requirements" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    /* -----------------------------
       Optional lead update
    ------------------------------ */
    if (lead_id && discovery_state) {
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          discovery_state,
          estimateTime_min,
          estimateTime_max,
          budget_min,
          budget_max,
          description,
        })
        .eq("lead_id", lead_id);

      if (leadError) {
        console.error("[createRequirements] Lead update error:", leadError);
        return new Response(
          JSON.stringify({ error: "Failed to update lead" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({ inserted: count ?? features.length }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[createRequirements] Unexpected error:", error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
