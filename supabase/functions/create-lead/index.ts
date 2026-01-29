// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createProposal } from "./createProposal.js";
import { sendWelcomeMail } from "./sendWelcomeEmail.js";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,
  Deno.env.get("SERVICE_SECRET_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  console.log("HOLAAAAAAAAAAAAAAAAAAA");

  try {
    const body = await req.json();

    if (!body.selectedTime?.start || !body.selectedTime?.end) {
      return new Response(
        JSON.stringify({ error: "Missing selectedTime.start or end" }),
        { status: 400 },
      );
    }

    const startDate = new Date(body.selectedTime.start);
    const leadId = crypto.randomUUID();

    /* -------------------------------------------------
     * 1. (Optional) Cal.com booking
     * ------------------------------------------------- */

    /* const bookingRes = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("CAL_KEY")}`,
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify(bookingPayload),
    });

    const bookingData = await bookingRes.json();
    const schedulingUrl = bookingData?.data?.meetingUrl ?? body.scheduling_url; */

    const schedulingUrl = "https://cal.com/kabir-malkani-glnivq/15min";

    /* -------------------------------------------------
     * 2. Insert lead into Supabase
     * ------------------------------------------------- */

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        lead_id: leadId,
        first_name: body.name,
        email: body.email,
        company: body.companyName,
        industry: body.industry,
        budget_min: body.monthlybudget?.min,
        budget_max: body.monthlybudget?.max,
        estimateTime_min: body.estimateTimeline?.min,
        estimateTime_max: body.estimateTimeline?.max,
        description: body.productIdea,
        formatted_date: startDate,
        scheduling_url: schedulingUrl,
        booking_status: "confirmed",
        email_sent: false,
      })
      .select()
      .single();

    if (leadError) {
      console.error("Failed to insert lead:", leadError);
      return new Response(JSON.stringify({ error: leadError.message }), {
        status: 500,
      });
    }

    console.log("lead created", lead);

    /* -------------------------------------------------
     * 3. Proposal + email (left as-is)
     * ------------------------------------------------- */

    try {
      const proposalData = await createProposal({
        lead_id: lead.lead_id,
        creator_email: lead.email,
      });

      const responseEmail = await sendWelcomeMail({
        email: body.email,
        name: body.name,
        leadId: lead.lead_id,
        schedulingUrl,
        proposalLink: `http://localhost:4321/proposal?mode=features&passcode=${proposalData.passcode}`,
      });
      console.log("responseEmail", responseEmail);

      await supabase
        .from("leads")
        .update({
          email_sent: true,
          email_sent_at: new Date(),
        })
        .eq("lead_id", lead.lead_id);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    /* -------------------------------------------------
     * 4. Response
     * ------------------------------------------------- */

    return new Response(
      JSON.stringify({
        id: lead.lead_id,
        scheduling_url: schedulingUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("[supabase] Error creating submission:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
