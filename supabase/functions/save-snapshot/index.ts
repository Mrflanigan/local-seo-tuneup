import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, city, label, overallScore, letterGrade, report, notes } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!report || typeof report !== "object") {
      return new Response(
        JSON.stringify({ success: false, error: "Report data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error: insertError } = await supabase.from("scan_snapshots").insert({
      url,
      city: city || null,
      label: label || "before",
      overall_score: overallScore,
      letter_grade: letterGrade,
      report_json: report,
      notes: notes || null,
    }).select("id").single();

    if (insertError) {
      console.error("[save-snapshot] Insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save snapshot" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[save-snapshot] Saved ${label || "before"} snapshot for ${url}: ${overallScore} (${letterGrade})`);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[save-snapshot] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to save snapshot";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
