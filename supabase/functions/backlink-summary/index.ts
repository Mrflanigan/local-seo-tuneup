const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BacklinkSummaryResult {
  target: string;
  totalBacklinks: number;
  referringDomains: number;
  domainRank: number;          // 0-100, similar to DA/DR
  brokenBacklinks: number;
  referringIps: number;
  followLinks: number;
  nofollowLinks: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'A valid URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creds = Deno.env.get('DATAFORSEO_CREDENTIALS');
    if (!creds) {
      console.warn('DATAFORSEO_CREDENTIALS not set');
      return new Response(
        JSON.stringify({ success: false, error: 'Backlink data not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain from URL
    let target: string;
    try {
      target = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      target = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }

    console.log(`[backlink-summary] Fetching backlinks for: ${target}`);

    const resp = await fetch(
      'https://api.dataforseo.com/v3/backlinks/summary/live',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${creds}`,
        },
        body: JSON.stringify([{ target, internal_list_limit: 0, backlinks_status_type: 'live' }]),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('[backlink-summary] DataForSEO error:', resp.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'Backlink lookup failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await resp.json();
    const result = data?.tasks?.[0]?.result?.[0];

    if (!result) {
      console.warn('[backlink-summary] No result returned');
      return new Response(
        JSON.stringify({ success: true, data: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const summary: BacklinkSummaryResult = {
      target,
      totalBacklinks: result.backlinks || 0,
      referringDomains: result.referring_domains || 0,
      domainRank: result.rank || 0,
      brokenBacklinks: result.broken_backlinks || 0,
      referringIps: result.referring_ips || 0,
      followLinks: result.referring_links_types?.anchor || result.backlinks_nofollow ? 
        (result.backlinks || 0) - (result.backlinks_nofollow || 0) : result.backlinks || 0,
      nofollowLinks: result.backlinks_nofollow || 0,
    };

    console.log(`[backlink-summary] ${target}: ${summary.referringDomains} referring domains, rank=${summary.domainRank}, backlinks=${summary.totalBacklinks}`);

    return new Response(
      JSON.stringify({ success: true, data: summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[backlink-summary] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
