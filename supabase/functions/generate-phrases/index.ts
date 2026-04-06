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

    // Use Lovable AI proxy (gemini-2.5-flash) to generate search phrases
    const prompt = `You are an SEO keyword researcher. Given a business description, generate the top 5 search phrases that a potential customer would type into Google to find this business.

Business name: ${businessName || 'unknown'}
Description: ${description.trim()}
${city ? `Location: ${city}` : ''}

Rules:
- Return ONLY a JSON array of strings, no explanation
- Each phrase should be 2-5 words (no city name — we add that separately)
- Focus on what customers search, not how the business describes itself
- Include a mix of service-specific and general intent phrases
- Order by likely search volume (highest first)

Example output: ["lawn care service", "moss removal", "landscaping company", "yard cleanup", "lawn maintenance"]`;

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

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI proxy error:', errText);
      // Fallback: split description into phrases
      const fallback = description.trim().split(/,|;|\band\b/).map((s: string) => s.trim()).filter(Boolean).slice(0, 5);
      return new Response(
        JSON.stringify({ success: true, phrases: fallback.length > 0 ? fallback : [description.trim().slice(0, 40)] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON array from response (handle markdown code blocks)
    let phrases: string[] = [];
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      phrases = JSON.parse(cleaned);
    } catch {
      // Fallback: split by newlines
      phrases = content.split('\n').map((l: string) => l.replace(/^[\d\-\*\.]+\s*/, '').replace(/"/g, '').trim()).filter(Boolean);
    }

    // Ensure we have usable phrases
    phrases = phrases.filter((p: string) => typeof p === 'string' && p.length > 1).slice(0, 5);
    
    if (phrases.length === 0) {
      phrases = [description.trim().slice(0, 40)];
    }

    console.log(`Generated ${phrases.length} phrases from description: "${description.slice(0, 50)}..."`);

    return new Response(
      JSON.stringify({ success: true, phrases }),
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
