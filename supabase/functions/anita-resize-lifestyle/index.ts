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
    let width: number, height: number, orientation: string;
    switch (aspectRatio) {
      case "1:1":
        width = 1080;
        height = 1080;
        orientation = "square";
        break;
      case "9:16":
        width = 1080;
        height = 1920;
        orientation = "vertical portrait";
        break;
      case "16:9":
      default:
        width = 1920;
        height = 1080;
        orientation = "horizontal landscape";
        break;
    }

    console.log(`Resizing lifestyle image to ${aspectRatio} (${width}x${height}) - ${orientation}`);

    // Extract base64 data from data URL if present
    let cleanBase64 = imageBase64;
    if (imageBase64.startsWith("data:")) {
      const base64Match = imageBase64.match(/^data:image\/[^;]+;base64,(.+)$/);
      if (base64Match) {
        cleanBase64 = base64Match[1];
      }
    }

    const prompt = `Transform this lifestyle product image to a ${orientation} format (${aspectRatio} aspect ratio, ${width}x${height} pixels).

IMPORTANT INSTRUCTIONS:
1. The product in the image MUST remain completely visible - do NOT crop or cut any part of the product
2. Intelligently extend or recompose the background/surroundings to fill the new ${orientation} canvas
3. Keep the product as the main focal point, naturally positioned within the new frame
4. Maintain the same lighting, color palette, and professional photography style
5. The extended areas should blend seamlessly with the existing image
6. Generate the final image at exactly ${width} pixels wide and ${height} pixels tall

${aspectRatio === "9:16" ? "For this vertical format: extend the scene vertically, adding more environment above and/or below the product while keeping the product fully visible and prominent." : ""}
${aspectRatio === "1:1" ? "For this square format: create a balanced composition with the product centered, extending the background equally on sides if needed." : ""}
${aspectRatio === "16:9" ? "For this wide horizontal format: extend the scene horizontally, adding more of the lifestyle environment to the left and/or right while keeping the product as the central focus." : ""}`;

    console.log("Sending request to Lovable AI for resize...");

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
    console.log("Resize response received successfully");

    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(result).substring(0, 500));
      throw new Error("No image generated from Lovable AI");
    }

    // Extract base64 from data URL
    const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format from Lovable AI");
    }

    console.log(`Successfully resized image to ${aspectRatio}`);

    return new Response(
      JSON.stringify({
        success: true,
        imageBase64: base64Match[1],
        dimensions: { width, height },
        aspectRatio,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in anita-resize-lifestyle:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Resize failed" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
