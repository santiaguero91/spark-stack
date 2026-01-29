import { z } from "https://esm.sh/zod@3.23.8";

export const QuerySchema = z.object({
  passcode: z.string().min(1),
});

const LeadSchema = z.object({
  description: z.string().nullable(),
  formatted_date: z.string().nullable(),
  estimateTime_min: z.number().nullable(),
  estimateTime_max: z.number().nullable(),
  budget_min: z.number().nullable(),
  budget_max: z.number().nullable(),
});

export const ProposalSchema = z.object({
  proposal_id: z.string().uuid(),
  lead_id: z.string().uuid().nullable(),

  creator_email: z.string().email().nullable(),
  passcode: z.string(),

  stage: z.string().nullable(),
  total_duration: z.string().nullable(),
  why_this_stack: z.string().nullable(),
  signature_url: z.string().nullable(),

  created_at: z.string(), // timestamp with time zone
  updated_at: z.string().nullable(),
  signed_at: z.string().nullable(),

  // jsonb columns
  scopes: z.unknown().nullable(),
  deliverables: z.unknown().nullable(),
  dependencies: z.unknown().nullable(),
  payment_milestones: z.unknown().nullable(),
  cost_breakdown: z.unknown().nullable(),
  assumptions: z.unknown().nullable(),
  team: z.unknown().nullable(),
  stack_section: z.unknown().nullable(),
  summary_items: z.unknown().nullable(),
  milestones: z.unknown().nullable(),
  sections: z.unknown().nullable(),
  initial_total_investment: z.unknown().nullable(),
});

export const SignProposalSchema = z.object({
  proposalId: z.string().min(1),
  signatureBase64: z
    .string()
    .min(1)
    .refine(
      (v) => /^data:image\/(png|jpeg|jpg);base64,/.test(v),
      "Invalid base64 image format",
    ),
});

export const ProposalLookupSchema = z.object({
  passcode: z.string(),
  stage: z.string(),
});

const ForbiddenUpdateFields = z.object({
  proposal_id: z.never(),
  passcode: z.never(),
  created_at: z.never(),
  signed_at: z.never(),
});

export const ProposalUpdatesSchema = ProposalSchema.partial()
  .omit({
    proposal_id: true,
    passcode: true,
    created_at: true,
    signed_at: true,
  })
  .merge(ForbiddenUpdateFields)
  .strict();

export const UpdateProposalBodySchema = z.object({
  passcode: z.string().min(1),
  updates: ProposalUpdatesSchema,
});
