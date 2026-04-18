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
// Strict: only accept City / DMA / State whose location_name actually contains
// a token from the user's input. Never silently accept a Country match.
async function resolveLocationCode(city: string, creds: string): Promise<number | null> {
  try {
    // Strip noise like "metro area", "greater", "downtown" before matching
    const cleaned = city
      .toLowerCase()
      .replace(/\b(metro area|metro|greater|downtown|area|region)\b/g, '')
      .trim();
    const tokens = cleaned
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(t => t.length >= 3); // ignore "wa", "of", etc.

    if (tokens.length === 0) {
      console.warn(`No usable tokens in city input "${city}"`);
      return null;
    }

    const resp = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/locations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${creds}`,
        },
        body: JSON.stringify([{ country: 'US', search: cleaned, limit: 20 }]),
      }
    );
    if (!resp.ok) {
      console.warn('Location lookup failed:', resp.status);
      return null;
    }
    const data = await resp.json();
    const results: any[] = data?.tasks?.[0]?.result || [];

    // Only consider local-scoped matches whose name contains an input token
    const localTypes = new Set(['City', 'DMA Region', 'State', 'Region']);
    const typePriority: Record<string, number> = {
      'City': 0,
      'DMA Region': 1,
      'Region': 2,
      'State': 3,
    };

    const candidates = results.filter(r => {
      if (!localTypes.has(r.location_type)) return false;
      const name = (r.location_name || '').toLowerCase();
      return tokens.some(t => name.includes(t));
    });

    if (candidates.length === 0) {
      console.warn(`No local match for "${city}" (rejected ${results.length} non-matching results, including any Country matches)`);
      return null;
    }

    candidates.sort((a, b) =>
      (typePriority[a.location_type] ?? 9) - (typePriority[b.location_type] ?? 9)
    );
    const best = candidates[0];
    console.log(`Resolved "${city}" → ${best.location_name} (${best.location_code}, ${best.location_type})`);
    return best.location_code;
  } catch (e) {
    console.warn('Location resolution error:', e);
    return null;
  }
}

// ── Validate AI seed phrases: must be array of 3+ short, clean phrases ──
function validateSeedPhrases(phrases: unknown): string[] | null {
  if (!Array.isArray(phrases)) return null;
  const cleaned = phrases
    .filter((p): p is string => typeof p === 'string')
    .map(p => p.trim())
    .filter(p => {
      if (p.length < 3 || p.length > 60) return false;
      const wordCount = p.split(/\s+/).length;
      if (wordCount < 1 || wordCount > 6) return false;
      // Reject punctuation soup (multiple dots, ellipses, slashes)
      if (/\.{2,}|…|\.\s*\./.test(p)) return false;
      if ((p.match(/[.,;:!?]/g) || []).length > 1) return false;
      return true;
    });
  return cleaned.length >= 3 ? cleaned.slice(0, 10) : null;
}

// ── Call Gemini for seed phrases with one retry on bad output ──
async function generateSeedPhrases(
  prompt: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<string[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const stricterPrompt = attempt === 0
      ? prompt
      : prompt + '\n\nSTRICT: Return ONLY a JSON array of 10 strings. Each string is 2-5 words. No ellipses, no dots, no slashes. Example: ["lawn care","moss removal","yard cleanup",...]';

    try {
      const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: stricterPrompt }],
        }),
      });
      if (!aiResponse.ok) continue;
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Try to extract a JSON array substring
        const arrMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrMatch) {
          try { parsed = JSON.parse(arrMatch[0]); } catch { parsed = null; }
        }
      }

      const valid = validateSeedPhrases(parsed);
      if (valid) {
        console.log(`Seed phrases (attempt ${attempt + 1}):`, valid);
        return valid;
      }
      console.warn(`Attempt ${attempt + 1} returned invalid phrases:`, parsed);
    } catch (e) {
      console.warn(`Attempt ${attempt + 1} threw:`, e);
    }
  }
  return [];
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

// ── Fetch domain ranks for top SERP competitors to estimate difficulty ──
async function fetchCompetitorRanks(
  domains: string[],
  creds: string
): Promise<Map<string, number>> {
  const rankMap = new Map<string, number>();
  if (domains.length === 0) return rankMap;

  // Batch up to 10 domains in parallel
  const uniqueDomains = [...new Set(domains)].slice(0, 10);
  
  try {
    // DataForSEO allows multiple targets in one request via separate task items
    const tasks = uniqueDomains.map(d => ({ target: d, internal_list_limit: 0, backlinks_status_type: 'live' }));
    const resp = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${creds}`,
      },
      body: JSON.stringify(tasks),
    });

    if (resp.ok) {
      const data = await resp.json();
      const results = data?.tasks || [];
      for (const task of results) {
        const r = task?.result?.[0];
        if (r?.target && typeof r.rank === 'number') {
          rankMap.set(r.target.replace(/^www\./, '').toLowerCase(), r.rank);
        }
      }
    }
  } catch (e) {
    console.warn('Competitor rank lookup failed:', e);
  }

  return rankMap;
}

function getDifficultyLabel(avgRank: number): { level: string; color: string } {
  if (avgRank >= 60) return { level: 'Very Hard', color: '#ef4444' };
  if (avgRank >= 40) return { level: 'Hard', color: '#f97316' };
  if (avgRank >= 20) return { level: 'Moderate', color: '#eab308' };
  if (avgRank >= 5) return { level: 'Achievable', color: '#22c55e' };
  return { level: 'Low Competition', color: '#3b82f6' };
}

// ── Use Firecrawl search to find top competitors for a phrase ──
async function findTopCompetitorDomains(phrase: string, city: string): Promise<string[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];

  const searchQuery = city ? `${phrase} ${city}` : phrase;
  try {
    const resp = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery, limit: 5 }),
    });

    if (!resp.ok) return [];
    const data = await resp.json();
    const results = data.data || [];
    
    return results
      .map((r: any) => {
        try {
          return new URL(r.url).hostname.replace(/^www\./, '').toLowerCase();
        } catch { return null; }
      })
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
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



    const aiSeeds = await generateSeedPhrases(prompt, supabaseUrl, serviceKey);
    let seedPhrases: string[] = aiSeeds;

    if (seedPhrases.length === 0) {
      // Fallback: split the user's description into rough phrases
      seedPhrases = description
        .trim()
        .split(/,|;|\band\b|\bor\b/)
        .map((s: string) => s.trim().replace(/\.+$/, ''))
        .filter((s: string) => s.length >= 3 && s.split(/\s+/).length <= 6)
        .slice(0, 10);
      console.log('Using description-fallback seed phrases:', seedPhrases);
    }

    if (seedPhrases.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "We couldn't generate search phrases from that description. Try describing the services in 1–3 short phrases (e.g. 'lawn care, moss removal, yard cleanup').",
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // ── Step 4: Estimate difficulty per bucket using competitor domain ranks ──
    let bucketDifficulty: Record<string, { avgCompetitorRank: number; level: string; color: string; topCompetitors: string[] }> = {};
    try {
      // For top 3 buckets, search the top canonical phrase and get competitor domain ranks
      const topBuckets = intentBuckets.slice(0, 3);
      const competitorSearches = await Promise.all(
        topBuckets.map(b => findTopCompetitorDomains(b.canonical_phrases[0] || b.keywords[0]?.keyword || '', city || ''))
      );

      // Collect all unique competitor domains
      const allDomains = competitorSearches.flat();
      const rankMap = allDomains.length > 0 ? await fetchCompetitorRanks(allDomains, creds) : new Map();

      for (let i = 0; i < topBuckets.length; i++) {
        const bucket = topBuckets[i];
        const competitors = competitorSearches[i];
        const ranks = competitors.map(d => rankMap.get(d) || 0).filter(r => r > 0);
        const avgRank = ranks.length > 0 ? Math.round(ranks.reduce((s, r) => s + r, 0) / ranks.length) : 0;
        const difficulty = getDifficultyLabel(avgRank);
        bucketDifficulty[bucket.id] = {
          avgCompetitorRank: avgRank,
          level: difficulty.level,
          color: difficulty.color,
          topCompetitors: competitors,
        };
      }
      console.log(`Difficulty assessed for ${Object.keys(bucketDifficulty).length} buckets`);
    } catch (diffErr) {
      console.warn('Difficulty assessment failed (non-fatal):', diffErr);
    }

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
        bucketDifficulty,
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
