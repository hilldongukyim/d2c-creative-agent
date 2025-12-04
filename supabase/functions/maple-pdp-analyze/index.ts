import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, htmlContent, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (analysisType === "summary") {
      systemPrompt = `You are Maple, a friendly and knowledgeable product curator AI assistant. 
Your role is to analyze product pages and provide helpful insights to customers.

When analyzing a product page, you should:
1. Identify the key product features and benefits
2. Explain why customers should consider buying this product
3. Describe what type of customers would benefit most from this product
4. Highlight any unique selling points
5. Provide a balanced, helpful recommendation

Always respond in a friendly, conversational tone. Keep your analysis concise but comprehensive.
Respond in the same language as the product page content (Korean for Korean pages, English for English pages).`;

      userPrompt = `Please analyze this product page and provide a curated recommendation:

URL: ${url}

Page Content:
${htmlContent}

Please provide:
1. A brief product summary
2. Key reasons why customers should consider this product
3. Who would benefit most from this product
4. Any notable features or unique selling points
5. Your overall recommendation`;

    } else if (analysisType === "audit") {
      systemPrompt = `You are Maple, a PDP (Product Detail Page) content auditor. 
Your role is to analyze product pages and provide a comprehensive content audit.

You should identify:
- What content elements ARE present on the page
- What content elements are MISSING that should typically be on a PDP
- Quality assessment of each content section

Common PDP content elements to check:
- Product title and subtitle
- Product images (hero, gallery, lifestyle)
- Price and promotions
- Product description (short and long)
- Key features and specifications
- Technical specifications table
- Customer reviews and ratings
- Q&A section
- Related/recommended products
- Add to cart/Buy now buttons
- Availability/Stock status
- Shipping information
- Return policy
- Brand information
- Video content
- 360° view
- AR/VR experience
- Size guide (if applicable)
- Color/variant options
- Bundle offers
- Warranty information
- Installation/Setup information
- Comparison tools
- Social proof elements
- Trust badges/certifications

Format your response as a clear checklist with ✅ for present and ❌ for missing items.
Add notes about quality where relevant.`;

      userPrompt = `Please audit this product page content:

URL: ${url}

Page Content:
${htmlContent}

Provide a comprehensive content audit showing:
1. ✅ Content elements that ARE present (with quality notes)
2. ❌ Content elements that are MISSING
3. Overall content completeness score (%)
4. Priority recommendations for improvement`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in maple-pdp-analyze:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
