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
    const { url } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from("scan_snapshots").select("*").order("created_at", { ascending: true });

    if (url) {
      // Normalize: match by hostname
      try {
        const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
        query = query.ilike("url", `%${hostname}%`);
      } catch {
        query = query.eq("url", url);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[get-snapshots] Query error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch snapshots" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[get-snapshots] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch snapshots";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
