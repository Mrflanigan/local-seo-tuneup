const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { question, scanContext } = await req.json();
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) throw new Error('PERPLEXITY_API_KEY not configured');

    // Build system prompt with scan data so Perplexity advice stays consistent with the report
    let systemPrompt = "You are an SEO advisor for local service businesses. Be specific and actionable.";
    if (scanContext) {
      const ctx = scanContext;
      systemPrompt += `\n\nContext from the user's latest site scan:`;
      if (ctx.url) systemPrompt += `\n- Website: ${ctx.url}`;
      if (ctx.overallScore != null) systemPrompt += `\n- Site Health Score: ${ctx.overallScore}/100 (${ctx.letterGrade})`;
      if (ctx.indexed != null) systemPrompt += `\n- Google Indexed: ${ctx.indexed ? "Yes" : "NO — critical issue"}`;
      if (ctx.domainRanksFirst != null) systemPrompt += `\n- Ranks #1 for own domain: ${ctx.domainRanksFirst ? "Yes" : "No"}`;
      if (ctx.brandSearchPosition) systemPrompt += `\n- Brand name search position: #${ctx.brandSearchPosition}`;
      if (ctx.topIssues?.length) systemPrompt += `\n- Top issues to fix: ${ctx.topIssues.join("; ")}`;
      systemPrompt += `\n\nIMPORTANT: Your advice must be consistent with these findings. Do not contradict the scan data.`;
    }

    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      }),
    });

    const data = await resp.json();
    const answer = data.choices?.[0]?.message?.content ?? 'No response';
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
