import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateCurationText(url: string, htmlContent: string, lovableApiKey: string): Promise<string> {
  const systemPrompt = `You are Maple, a friendly and knowledgeable product curator with a warm, engaging voice. 
Your role is to create podcast-style audio scripts that feel like a personal shopping consultant talking to a customer.

Guidelines for your script:
- Speak naturally and conversationally, as if talking to a friend
- Use Korean language for Korean product pages, English for English pages
- Keep it concise but engaging (around 30-45 seconds when spoken)
- Start with a friendly greeting and product introduction
- Highlight 2-3 key selling points with enthusiasm
- Mention who would love this product
- End with a warm recommendation
- Avoid technical jargon, use everyday language
- Add natural pauses and transitions
- Sound excited but genuine, not salesy`;

  const userPrompt = `Create a podcast-style curation script for this product page:

URL: ${url}

Page Content:
${htmlContent}

Remember: Write as if you're speaking directly to a customer, making them feel excited about this product. Keep it natural and conversational.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateAudio(text: string, elevenLabsApiKey: string): Promise<string> {
  // Using Sarah voice - warm, friendly female voice
  const voiceId = "EXAVITQu4vr4xnSDxMaL";
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": elevenLabsApiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ElevenLabs error:", response.status, errorText);
    throw new Error(`ElevenLabs TTS failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  return base64Audio;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, htmlContent, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle podcast curation (summary with audio)
    if (analysisType === "summary" || analysisType === "podcast") {
      if (!ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not configured");
      }

      console.log("Generating curation text...");
      const curationText = await generateCurationText(url, htmlContent, LOVABLE_API_KEY);
      console.log("Curation text generated, length:", curationText.length);

      console.log("Generating audio...");
      const audioBase64 = await generateAudio(curationText, ELEVENLABS_API_KEY);
      console.log("Audio generated, base64 length:", audioBase64.length);

      return new Response(
        JSON.stringify({ 
          success: true, 
          audioBase64,
          script: curationText,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle audit (text streaming as before)
    if (analysisType === "audit") {
      const systemPrompt = `You are Maple, a PDP (Product Detail Page) content auditor. 
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

      const userPrompt = `Please audit this product page content:

URL: ${url}

Page Content:
${htmlContent}

Provide a comprehensive content audit showing:
1. ✅ Content elements that ARE present (with quality notes)
2. ❌ Content elements that are MISSING
3. Overall content completeness score (%)
4. Priority recommendations for improvement`;

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
    }

    return new Response(JSON.stringify({ error: "Invalid analysis type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in maple-pdp-analyze:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
