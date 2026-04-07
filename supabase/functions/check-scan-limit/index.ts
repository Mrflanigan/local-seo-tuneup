import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers (Supabase edge functions expose this)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { action } = await req.json(); // "check" or "increment"

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];

    if (action === "check") {
      // Check current count and block status
      const { data: existing } = await supabase
        .from("scan_rate_limits")
        .select("scan_count, is_blocked, blocked_until")
        .eq("ip_address", ip)
        .eq("scan_date", today)
        .maybeSingle();

      // Check if blocked
      if (existing?.is_blocked) {
        const blockedUntil = existing.blocked_until
          ? new Date(existing.blocked_until)
          : null;
        if (blockedUntil && blockedUntil > new Date()) {
          return new Response(
            JSON.stringify({
              allowed: false,
              reason: "blocked",
              message:
                "We detected automated use. If this is a mistake, contact us.",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      const scanCount = existing?.scan_count || 0;
      const needsContext = scanCount >= 1; // After first scan, ask for context

      if (scanCount >= DAILY_LIMIT) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: "limit_reached",
            scanCount,
            message:
              "You've used your complimentary scans from this connection today. If you're an agency or need more, reach out and we'll set you up properly instead of hacking around it.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          scanCount,
          remaining: DAILY_LIMIT - scanCount,
          needsContext,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "increment") {
      // Upsert: increment count or create new row
      const { data: existing } = await supabase
        .from("scan_rate_limits")
        .select("id, scan_count")
        .eq("ip_address", ip)
        .eq("scan_date", today)
        .maybeSingle();

      if (existing) {
        const newCount = existing.scan_count + 1;

        // If they've hit the limit 3+ days in a row, flag as suspicious
        const { data: recentDays } = await supabase
          .from("scan_rate_limits")
          .select("scan_date")
          .eq("ip_address", ip)
          .gte("scan_count", DAILY_LIMIT)
          .order("scan_date", { ascending: false })
          .limit(5);

        const shouldBlock = (recentDays?.length || 0) >= 3 && newCount > DAILY_LIMIT;

        await supabase
          .from("scan_rate_limits")
          .update({
            scan_count: newCount,
            is_blocked: shouldBlock,
            blocked_until: shouldBlock
              ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("scan_rate_limits").insert({
          ip_address: ip,
          scan_date: today,
          scan_count: 1,
        });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'check' or 'increment'." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[check-scan-limit] Error:", error);
    // On error, allow the scan (fail open) so real users aren't blocked
    return new Response(
      JSON.stringify({ allowed: true, scanCount: 0, remaining: DAILY_LIMIT, needsContext: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
