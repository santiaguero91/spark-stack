// @ts-nocheck
import { serve } from "https://deno.land/std/http/server.ts";
import { getByPasscode } from "./get-by-passcode.ts";
import { updateProposal } from "./update-proposal.ts";

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    return getByPasscode(req);
  }

  if (req.method === "PATCH") {
    return updateProposal(req);
  }

  return new Response("Not found", { status: 404 });
});
