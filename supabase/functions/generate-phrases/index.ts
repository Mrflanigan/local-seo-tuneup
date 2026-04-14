const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeedPhrase {
  phrase: string;
  intentBucket: string;
}

interface KeywordResult {
  keyword: string;
  volume: number;
  competition: string | null;
  cpc: number | null;
}

interface IntentBucket {
  id: string;
  name: string;
  keywords: { keyword: string; search_volume: number }[];
  total_search_volume: number;
  canonical_phrases: string[];
}

// ── Resolve city name to DataForSEO location_code ──
async function resolveLocationCode(city: string, creds: string): Promise<number | null> {
  try {
    const resp = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/locations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${creds}`,
        },
        body: JSON.stringify([{ country: 'US', search: city, limit: 5 }]),
      }
    );
    if (!resp.ok) {
      console.warn('Location lookup failed:', resp.status);
      return null;
    }
    const data = await resp.json();
    const results = data?.tasks?.[0]?.result || [];
    // Prefer City or DMA-level matches
    const cityMatch = results.find((r: any) =>
      r.location_type === 'City' || r.location_type === 'DMA Region'
    );
    const bestMatch = cityMatch || results[0];
    if (bestMatch?.location_code) {
      console.log(`Resolved "${city}" → ${bestMatch.location_name} (${bestMatch.location_code}, ${bestMatch.location_type})`);
      return bestMatch.location_code;
    }
    return null;
  } catch (e) {
    console.warn('Location resolution error:', e);
    return null;
  }
}

// ── Cluster keywords into intent buckets using AI ──
async function clusterIntoBuckets(
  keywords: KeywordResult[],
  city: string
): Promise<IntentBucket[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  const keywordList = keywords.map(k => `"${k.keyword}" (${k.volume}/mo)`).join('\n');

  const prompt = `You are grouping search keywords into intent buckets for a local service business in ${city || 'their area'}.

Keywords with monthly search volumes:
${keywordList}

Rules:
- Group into 2-6 buckets by customer intent/problem
- Each bucket needs: id (snake_case), name (human-readable problem label)
- Assign each keyword to exactly one bucket
- For each bucket, pick 1-3 "canonical phrases" — the shortest, highest-volume phrases that best represent the bucket
- Return ONLY valid JSON, no explanation

Return format:
[
  {
    "id": "bucket_id",
    "name": "Human Readable Problem",
    "keyword_assignments": ["keyword1", "keyword2"],
    "canonical_phrases": ["best phrase", "second best"]
  }
]`;

  try {
    const aiResp = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiResp.ok) throw new Error('AI clustering failed');

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const rawBuckets = JSON.parse(cleaned);

    // Build keyword lookup
    const kwMap = new Map(keywords.map(k => [k.keyword.toLowerCase(), k]));

    return rawBuckets.map((b: any) => {
      const bucketKeywords = (b.keyword_assignments || [])
        .map((kw: string) => {
          const match = kwMap.get(kw.toLowerCase());
          return match ? { keyword: match.keyword, search_volume: match.volume } : null;
        })
        .filter(Boolean);

      return {
        id: b.id,
        name: b.name,
        keywords: bucketKeywords,
        total_search_volume: bucketKeywords.reduce((s: number, k: any) => s + k.search_volume, 0),
        canonical_phrases: b.canonical_phrases || [],
      };
    });
  } catch (e) {
    console.warn('AI clustering failed, using single bucket:', e);
    // Fallback: one big bucket
    return [{
      id: 'services',
      name: 'Your Services',
      keywords: keywords.map(k => ({ keyword: k.keyword, search_volume: k.volume })),
      total_search_volume: keywords.reduce((s, k) => s + k.volume, 0),
      canonical_phrases: keywords.slice(0, 3).map(k => k.keyword),
    }];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, city, businessName, whoYouServe } = await req.json();

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please describe what the business does (at least a few words).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Step 1: AI generates seed phrases ──
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const prompt = `You are an SEO keyword researcher. Given a business description, generate 10 seed search phrases that real customers would type into Google to find this type of business.

Business name: ${businessName || 'unknown'}
Description: ${description.trim()}
${whoYouServe ? `Target customers: ${whoYouServe}` : ''}
${city ? `Location: ${city}` : ''}

Rules:
- Return ONLY a JSON array of strings, no explanation
- Each phrase should be 2-5 words
- Do NOT include the city name in the phrases
- Focus on what customers actually search for
- Include a mix of service-specific and general intent phrases
- Think like a customer, not the business owner

Example output: ["lawn care service", "moss removal", "landscaping company", "yard cleanup", "lawn maintenance", "grass cutting", "lawn treatment", "weed control", "yard maintenance", "garden care"]`;

    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
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

    if (seedPhrases.length === 0) {
      seedPhrases = description.trim().split(/,|;|\band\b/).map((s: string) => s.trim()).filter(Boolean).slice(0, 10);
    }
    seedPhrases = seedPhrases.filter((p: string) => typeof p === 'string' && p.length > 1).slice(0, 10);
    console.log('Seed phrases from AI:', seedPhrases);

    // ── Step 2: Resolve location + call DataForSEO ──
    const creds = Deno.env.get('DATAFORSEO_CREDENTIALS');
    if (!creds) {
      console.warn('DATAFORSEO_CREDENTIALS not set');
      return new Response(
        JSON.stringify({ success: true, phrases: seedPhrases.slice(0, 5), volumes: null, intentBuckets: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve city to local location_code (falls back to US-wide 2840)
    let locationCode = 2840;
    if (city) {
      const resolved = await resolveLocationCode(city, creds);
      if (resolved) locationCode = resolved;
    }

    // Build keyword list: base phrases + localized versions
    const keywords = city
      ? [...seedPhrases, ...seedPhrases.slice(0, 5).map(p => `${p} ${city.split(',')[0].trim()}`)]
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
            location_code: locationCode,
            language_code: 'en',
          },
        ]),
      }
    );

    if (!dataForSeoResponse.ok) {
      const errText = await dataForSeoResponse.text();
      console.error('DataForSEO error:', dataForSeoResponse.status, errText);
      return new Response(
        JSON.stringify({ success: true, phrases: seedPhrases.slice(0, 5), volumes: null, intentBuckets: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const seoData = await dataForSeoResponse.json();
    const results = seoData?.tasks?.[0]?.result || [];

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

    keywordResults.sort((a, b) => b.volume - a.volume);
    const topKeywords = keywordResults.filter(k => k.volume > 0).slice(0, 15);

    if (topKeywords.length === 0) {
      console.log('No volume data found');
      return new Response(
        JSON.stringify({ success: true, phrases: seedPhrases.slice(0, 5), volumes: null, intentBuckets: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${topKeywords.length} keywords with volume, location_code=${locationCode}`);

    // ── Step 3: Cluster into intent buckets ──
    const intentBuckets = await clusterIntoBuckets(topKeywords, city || '');

    // Sort buckets by total volume descending
    intentBuckets.sort((a, b) => b.total_search_volume - a.total_search_volume);

    const totalDemand = intentBuckets.reduce((s, b) => s + b.total_search_volume, 0);
    console.log(`Intent buckets: ${intentBuckets.length}, total demand: ${totalDemand}/mo`);

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
        intentBuckets,
        locationCode,
        totalDemand,
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
