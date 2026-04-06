const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, city, businessName } = await req.json();

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please describe what the business does (at least a few words).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Step 1: Use AI to turn description into seed keyword ideas ──
    const prompt = `You are an SEO keyword researcher. Given a business description, generate 10 seed search phrases that real customers would type into Google to find this type of business.

Business name: ${businessName || 'unknown'}
Description: ${description.trim()}
${city ? `Location: ${city}` : ''}

Rules:
- Return ONLY a JSON array of strings, no explanation
- Each phrase should be 2-5 words
- Do NOT include the city name in the phrases
- Focus on what customers actually search for
- Include a mix of service-specific and general intent phrases
- Think like a customer, not the business owner

Example output: ["lawn care service", "moss removal", "landscaping company", "yard cleanup", "lawn maintenance", "grass cutting", "lawn treatment", "weed control", "yard maintenance", "garden care"]`;

    const aiResponse = await fetch('https://fnsyabzsopxqcyoqaprw.supabase.co/functions/v1/ai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    let seedPhrases: string[] = [];
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || '';
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        seedPhrases = JSON.parse(cleaned);
      } catch {
        seedPhrases = content.split('\n').map((l: string) => l.replace(/^[\d\-\*\.]+\s*/, '').replace(/"/g, '').trim()).filter(Boolean);
      }
    }

    // Fallback if AI failed
    if (seedPhrases.length === 0) {
      seedPhrases = description.trim().split(/,|;|\band\b/).map((s: string) => s.trim()).filter(Boolean).slice(0, 10);
    }
    seedPhrases = seedPhrases.filter((p: string) => typeof p === 'string' && p.length > 1).slice(0, 10);

    console.log('Seed phrases from AI:', seedPhrases);

    // ── Step 2: Look up REAL search volumes via DataForSEO ──
    const creds = Deno.env.get('DATAFORSEO_CREDENTIALS');
    if (!creds) {
      console.warn('DATAFORSEO_CREDENTIALS not set, returning seed phrases without volume data');
      return new Response(
        JSON.stringify({ success: true, phrases: seedPhrases.slice(0, 5), volumes: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If city is provided, also look up localized versions
    const keywords = city
      ? [...seedPhrases, ...seedPhrases.slice(0, 5).map(p => `${p} ${city}`)]
      : seedPhrases;

    const dataForSeoResponse = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${creds}`,
        },
        body: JSON.stringify([
          {
            keywords: keywords.slice(0, 20),
            location_code: 2840, // United States
            language_code: 'en',
          },
        ]),
      }
    );

    if (!dataForSeoResponse.ok) {
      const errText = await dataForSeoResponse.text();
      console.error('DataForSEO error:', dataForSeoResponse.status, errText);
      // Return seed phrases without volume data
      return new Response(
        JSON.stringify({ success: true, phrases: seedPhrases.slice(0, 5), volumes: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const seoData = await dataForSeoResponse.json();
    const results = seoData?.tasks?.[0]?.result || [];

    // Build a list of keywords with their real search volume
    interface KeywordResult {
      keyword: string;
      volume: number;
      competition: string | null;
      cpc: number | null;
    }

    const keywordResults: KeywordResult[] = [];
    for (const item of results) {
      if (item?.keyword && typeof item.search_volume === 'number') {
        keywordResults.push({
          keyword: item.keyword,
          volume: item.search_volume,
          competition: item.competition || null,
          cpc: item.cpc || null,
        });
      }
    }

    // Sort by volume (highest first) and take top results
    keywordResults.sort((a, b) => b.volume - a.volume);

    // Take top 10 with volume > 0, or fall back to seeds
    const topKeywords = keywordResults.filter(k => k.volume > 0).slice(0, 10);

    if (topKeywords.length === 0) {
      console.log('No volume data found, returning seed phrases');
      return new Response(
        JSON.stringify({ success: true, phrases: seedPhrases.slice(0, 5), volumes: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${topKeywords.length} keywords with real volume data`);
    console.log('Top keyword:', topKeywords[0]?.keyword, 'volume:', topKeywords[0]?.volume);

    return new Response(
      JSON.stringify({
        success: true,
        phrases: topKeywords.map(k => k.keyword),
        volumes: topKeywords.map(k => ({
          keyword: k.keyword,
          monthlySearches: k.volume,
          competition: k.competition,
          cpc: k.cpc,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-phrases:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
