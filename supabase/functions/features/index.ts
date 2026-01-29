// @ts-nocheck
import { serve } from "https://deno.land/std/http/server.ts";
import { fetchFeatures } from "./fetch-feature.ts";
import { createRequirements } from "./post-features.ts";

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    return fetchFeatures(req);
  }

  if (req.method === "POST") {
    return createRequirements(req);
  }

  return new Response("Not found", { status: 404 });
});
