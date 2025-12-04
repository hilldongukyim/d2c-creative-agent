import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOTOR_API_BASE = "https://api-b.fotor.com";

async function pollTaskResult(taskId: string, apiKey: string, maxAttempts = 30): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Polling task ${taskId}, attempt ${i + 1}/${maxAttempts}`);

    const response = await fetch(`${FOTOR_API_BASE}/v1/aiart/tasks/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to poll task: ${response.status}`);
    }

    const result = await response.json();
    console.log("Poll result status:", result.data?.status);

    if (result.code !== "000") {
      throw new Error(`Task error: ${result.msg}`);
    }

    const status = result.data?.status;

    if (status === 1) {
      const resultUrl = result.data?.resultUrl;
      if (!resultUrl) {
        throw new Error("No result URL in completed task");
      }
      return resultUrl;
    } else if (status === 2) {
      throw new Error("Background removal task failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Task timeout - background removal took too long");
}

async function removeBackground(imageUrl: string, fotorApiKey: string): Promise<string> {
  console.log("Downloading source image...");
  
  // Download the image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageArrayBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = base64Encode(new Uint8Array(imageArrayBuffer));
  
  console.log("Creating background removal task...");

  const createResponse = await fetch(`${FOTOR_API_BASE}/v1/aiart/backgroundremover`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fotorApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userImageUrl: `data:image/png;base64,${imageBase64}`,
      action: "auto",
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Fotor API error:", errorText);
    throw new Error(`Fotor API error: ${createResponse.status}`);
  }

  const createResult = await createResponse.json();

  if (createResult.code !== "000") {
    throw new Error(`Failed to create task: ${createResult.msg}`);
  }

  const taskId = createResult.data?.taskId;
  if (!taskId) {
    throw new Error("No taskId returned");
  }

  console.log("Task created:", taskId);

  // Poll for result
  const resultUrl = await pollTaskResult(taskId, fotorApiKey);
  console.log("Background removal complete, result URL:", resultUrl);

  // Download the result
  const resultResponse = await fetch(resultUrl);
  if (!resultResponse.ok) {
    throw new Error("Failed to download background-removed image");
  }

  const resultArrayBuffer = await resultResponse.arrayBuffer();
  return base64Encode(new Uint8Array(resultArrayBuffer));
}

async function generateLifestyleImage(productImageBase64: string, lovableApiKey: string): Promise<string> {
  console.log("Generating lifestyle image with Lovable AI...");

  const prompt = `Create a beautiful lifestyle marketing image at 1920x1080 resolution. 
Place this product naturally in an elegant, modern living room setting with soft natural lighting. 
The scene should feel aspirational and premium - think high-end interior design magazine style.
Include subtle lifestyle elements like plants, books, or decorative items in the background.
The product should be the clear focal point but integrated seamlessly into the environment.
Use warm, inviting colors and professional photography aesthetics.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
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
                url: `data:image/png;base64,${productImageBase64}`,
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
  console.log("Lovable AI response received");

  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) {
    throw new Error("No image generated from Lovable AI");
  }

  // Extract base64 from data URL
  const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) {
    throw new Error("Invalid image format from Lovable AI");
  }

  return base64Match[1];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const FOTOR_API_KEY = Deno.env.get("FOTOR_API_KEY");
    if (!FOTOR_API_KEY) {
      throw new Error("FOTOR_API_KEY not configured");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Starting lifestyle image generation for:", imageUrl);

    // Step 1: Remove background
    console.log("Step 1: Removing background...");
    const productImageBase64 = await removeBackground(imageUrl, FOTOR_API_KEY);
    console.log("Background removed, image length:", productImageBase64.length);

    // Step 2: Generate lifestyle image with Lovable AI
    console.log("Step 2: Generating lifestyle image...");
    const lifestyleImageBase64 = await generateLifestyleImage(productImageBase64, LOVABLE_API_KEY);
    console.log("Lifestyle image generated, length:", lifestyleImageBase64.length);

    return new Response(
      JSON.stringify({
        success: true,
        imageBase64: lifestyleImageBase64,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in anita-generate-lifestyle:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Generation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
