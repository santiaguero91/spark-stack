// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  DEFAULT_ASSUMPTIONS,
  DEFAULT_COST_BREACKDOWN,
  DEFAULT_DELIVERABLES,
  DEFAULT_DEPENDECIES,
  DEFAULT_MILESTONES,
  DEFAULT_PAYMENT_MILESTONES,
  DEFAULT_SCOPES,
  DEFAULT_SECTIONS,
  DEFAULT_STACK,
  DEFAULT_SUMMARY_ITEMS,
  DEFAULT_TEAM,
  DEFAULT_TOTAL_INVESTMENT,
  DEFAULT_WHY_THIS_STACK,
} from "./proposalDefaultValues.js";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_SECRET_KEY")!,
);

export const createProposal = async ({
  lead_id,
  creator_email,
}: {
  lead_id: string;
  creator_email: string;
}) => {
  // Deno-native crypto
  const proposalId = crypto.randomUUID();

  const passcode = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      proposal_id: proposalId,
      lead_id,
      creator_email,
      passcode,
      stage: "draft",
      total_duration: "16 weeks",
      why_this_stack: DEFAULT_WHY_THIS_STACK ?? "To be defined",
      scopes: DEFAULT_SCOPES,
      summary_items: DEFAULT_SUMMARY_ITEMS,
      sections: DEFAULT_SECTIONS,
      deliverables: DEFAULT_DELIVERABLES,
      dependencies: DEFAULT_DEPENDECIES,
      milestones: DEFAULT_MILESTONES,
      initial_total_investment: DEFAULT_TOTAL_INVESTMENT ?? null,
      cost_breakdown: DEFAULT_COST_BREACKDOWN,
      payment_milestones: DEFAULT_PAYMENT_MILESTONES,
      assumptions: DEFAULT_ASSUMPTIONS,
      team: DEFAULT_TEAM,
      stack_section: DEFAULT_STACK,
      signature_url: null,
    })
    .select()
    .single();

  if (error) {
    console.error("[createProposal] Supabase error:", error);
    throw error;
  }

  return proposal;
};
