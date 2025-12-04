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
    const { imageBase64, aspectRatio } = await req.json();

    if (!imageBase64) {
      throw new Error("Image base64 is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Determine dimensions based on aspect ratio
    let width: number, height: number;
    switch (aspectRatio) {
      case "1:1":
        width = 1080;
        height = 1080;
        break;
      case "9:16":
        width = 1080;
        height = 1920;
        break;
      case "16:9":
      default:
        width = 1920;
        height = 1080;
        break;
    }

    console.log(`Resizing lifestyle image to ${aspectRatio} (${width}x${height})`);

    // Extract base64 data from data URL if present
    let cleanBase64 = imageBase64;
    if (imageBase64.startsWith("data:")) {
      const base64Match = imageBase64.match(/^data:image\/[^;]+;base64,(.+)$/);
      if (base64Match) {
        cleanBase64 = base64Match[1];
      }
    }

    const prompt = `Resize and recompose this lifestyle image to ${width}x${height} resolution (${aspectRatio} aspect ratio).

CRITICAL REQUIREMENTS:
1. PRESERVE THE PRODUCT: The product in the image must remain fully visible and NOT be cropped or cut off
2. MAINTAIN COMPOSITION: Keep the product as the focal point of the image
3. EXTEND OR ADJUST BACKGROUND: If needed, intelligently extend the background or reposition elements to fit the new aspect ratio
4. KEEP QUALITY: Maintain the same high-quality, professional photography aesthetic
5. SEAMLESS RESULT: The resized image should look natural, not stretched or distorted

For ${aspectRatio === "9:16" ? "vertical (portrait)" : aspectRatio === "1:1" ? "square" : "horizontal (landscape)"} format:
- ${aspectRatio === "9:16" ? "Add more vertical space above and/or below the product, extending the lifestyle background naturally" : ""}
- ${aspectRatio === "1:1" ? "Create a balanced square composition with the product centered" : ""}
- ${aspectRatio === "16:9" ? "Ensure wide horizontal composition with product clearly visible" : ""}

Output exactly at ${width}x${height} pixels.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${cleanBase64}`,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add credits to your workspace.");
      }
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Resize response received");

    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      throw new Error("No image generated from Lovable AI");
    }

    // Extract base64 from data URL
    const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format from Lovable AI");
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageBase64: base64Match[1],
        dimensions: { width, height },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in anita-resize-lifestyle:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Resize failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
