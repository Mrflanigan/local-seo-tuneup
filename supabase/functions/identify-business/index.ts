const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phrases, city } = await req.json();

    if (!phrases || !Array.isArray(phrases) || phrases.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'At least one search phrase is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the search query — combine first phrase with city if provided
    const primaryPhrase = phrases[0].trim();
    const searchQuery = city ? `${primaryPhrase} ${city}` : primaryPhrase;

    console.log('Searching for:', searchQuery);

    // Use Firecrawl search to find top results
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 10,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || 'Search failed' }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract results — filter out directories, ads, aggregator sites
    const results = (searchData.data || [])
      .filter((r: any) => r.url && r.title)
      .slice(0, 8)
      .map((r: any) => ({
        url: r.url,
        title: r.title || '',
        description: r.description || '',
      }));

    // Infer business type from the search phrases
    const allPhrases = phrases.join(', ');
    let businessDescription = `${allPhrases}`;
    if (city) {
      businessDescription += ` in ${city}`;
    }

    console.log(`Found ${results.length} results for "${searchQuery}"`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          businessDescription,
          searchQuery,
          phrases,
          city: city || null,
          results,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in identify-business:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
