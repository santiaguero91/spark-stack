import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ISSUES_QUERY } from "./query.ts";

const LINEAR_GRAPHQL = "https://api.linear.app/graphql";


async function fetchIssues(projectIds: string[]) {
  const filter = {
    project: { id: { in: projectIds } },
    state: { name: { in: null } },
  };

  const res = await fetch(LINEAR_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Deno.env.get("LINEAR_API_KEY")}`,
    },
    body: JSON.stringify({
      query: ISSUES_QUERY,
      variables: { filter },
    }),
  });

  const data = await res.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));
  return data.data?.issues?.nodes || [];
}

Deno.serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const projectsParam = searchParams.get("projectIds");
    console.log("projectIds", projectsParam);

    if (!projectsParam) {
      return new Response(
        JSON.stringify({ error: "projectIds query param is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Split by "--" instead of ","
    const projectIds = projectsParam.split("--");
    const issues = await fetchIssues(projectIds);

    return new Response(JSON.stringify(issues), {
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
