import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  console.log("Downloading source image...");
  
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageArrayBuffer = await imageResponse.arrayBuffer();
  return base64Encode(new Uint8Array(imageArrayBuffer));
}

async function generateLifestyleImageWithReference(
  productImageBase64: string,
  referenceImageBase64: string,
  lovableApiKey: string,
  aspectRatio: string = "16:9",
  country: string | null = null,
  productDimensions: { width?: string; height?: string; depth?: string; raw?: string } | null = null,
  tvMountInfo: { mountType: string | null; isTV: boolean } | null = null
): Promise<string> {
  console.log("Generating lifestyle image WITH reference...");

  // Determine dimensions
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

  const countryContext = country
    ? `TARGET MARKET: ${country}\nCreate interior style authentic for ${country} homes.`
    : "";

  const dimensionsContext = productDimensions?.raw
    ? `PRODUCT SIZE: ${productDimensions.raw}\nMaintain realistic scale relative to furniture.`
    : "";

  const tvContext = tvMountInfo?.isTV && tvMountInfo?.mountType
    ? `TV MOUNT TYPE: ${tvMountInfo.mountType === "stand" ? "STAND - must be on furniture" : "WALL-MOUNT - must be on wall"}`
    : "";

  const prompt = `You are a world-class lifestyle photographer creating HIGH-END MARKETING IMAGERY.

⚠️ CRITICAL: You are given TWO images with DIFFERENT purposes:

📦 **FIRST IMAGE = PRODUCT (HERO)**
- This is the ONLY product that must appear in the final output
- Preserve EVERY detail of this product exactly as shown
- This product is the star - feature it prominently and beautifully

🎨 **SECOND IMAGE = STYLE REFERENCE ONLY**
- Use this ONLY for: camera angle, lighting mood, interior design style, color palette
- ⛔ DO NOT copy any objects, furniture, or products from this image
- ⛔ DO NOT recreate this room - create a COMPLETELY NEW environment
- ⛔ If there's any product/appliance in this reference - IGNORE IT completely

YOUR TASK:
1. Analyze the reference image's STYLE elements: lighting direction, color temperature, camera angle, interior aesthetic
2. Create a BRAND NEW premium room/environment that captures that same FEELING
3. Place the PRODUCT from the first image naturally and prominently in this new scene
4. Apply SEAMLESS compositing:
   - Match lighting direction and color temperature to the environment
   - Add realistic contact shadows and ambient occlusion
   - Ensure proper reflections on glossy surfaces
   - Maintain correct perspective and scale
5. The product must look like it was ACTUALLY PHOTOGRAPHED in this scene

QUALITY REQUIREMENTS:
- Ultra high resolution, sharp details throughout
- Professional studio lighting quality
- Magazine/catalog advertisement standard
- Photorealistic rendering - no AI artifacts
- Natural color grading matching the reference mood

OUTPUT: ${width}x${height} pixels

${countryContext}
${dimensionsContext}
${tvContext}

Generate a stunning, photorealistic lifestyle image now.`;

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
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${productImageBase64}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${referenceImageBase64}` },
            },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini AI error:", response.status, errorText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("CREDIT_EXPIRED");
    throw new Error(`Gemini AI error: ${response.status}`);
  }

  const result = await response.json();
  console.log("Gemini AI response received");

  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) throw new Error("No image generated from Gemini AI");

  const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) throw new Error("Invalid image format from Gemini AI");

  return base64Match[1];
}

async function generateLifestyleImage(
  productImageBase64: string,
  lovableApiKey: string,
  aspectRatio: string = "16:9",
  country: string | null = null,
  productDimensions: { width?: string; height?: string; depth?: string; raw?: string } | null = null,
  tvMountInfo: { mountType: string | null; isTV: boolean } | null = null
): Promise<string> {
  console.log("Generating lifestyle image WITHOUT reference...");

  // Determine dimensions
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

  const dimensionsContext = productDimensions
    ? `
PRODUCT PHYSICAL DIMENSIONS:
${productDimensions.raw ? `- Overall size: ${productDimensions.raw}` : ""}
${productDimensions.width ? `- Width: ${productDimensions.width}` : ""}
${productDimensions.height ? `- Height: ${productDimensions.height}` : ""}
${productDimensions.depth ? `- Depth: ${productDimensions.depth}` : ""}

Keep product scale realistic relative to furniture and room.
`
    : "";

  const tvMountContext = tvMountInfo?.isTV && tvMountInfo?.mountType
    ? `
TV PLACEMENT: ${tvMountInfo.mountType === "stand" ? "STAND VERSION - must be on furniture/TV stand" : "WALL-MOUNT VERSION - must be mounted on wall"}
`
    : "";

  const countryContext = country
    ? `
TARGET MARKET: ${country}
Create interior style authentic for ${country} homes.
`
    : "";

  const prompt = `You are a professional lifestyle photographer.

TASK: Create a stunning lifestyle marketing image at ${width}x${height} resolution.
${tvMountContext}
${dimensionsContext}
${countryContext}

INSTRUCTIONS:
1. Analyze the product in the image
2. Create a beautiful lifestyle scene where this product is naturally placed
3. Professional lighting, realistic shadows, proper scale
4. The product is the hero - make it prominent but natural

Generate the lifestyle image now.`;

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
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${productImageBase64}` },
            },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini AI error:", response.status, errorText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("CREDIT_EXPIRED");
    throw new Error(`Gemini AI error: ${response.status}`);
  }

  const result = await response.json();
  console.log("Gemini AI response received");

  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) throw new Error("No image generated from Gemini AI");

  const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) throw new Error("Invalid image format from Gemini AI");

  return base64Match[1];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, aspectRatio = "16:9", country = null, productDimensions = null, tvMountInfo = null, referenceImageBase64 = null } = await req.json();

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Starting lifestyle image generation for:", imageUrl, "aspectRatio:", aspectRatio, "country:", country, "hasReference:", !!referenceImageBase64);

    // Step 1: Download product image
    console.log("Step 1: Downloading product image...");
    const productImageBase64 = await downloadImageAsBase64(imageUrl);
    console.log("Product image downloaded, length:", productImageBase64.length);

    // Step 2: Generate lifestyle image
    let lifestyleImageBase64: string;

    if (referenceImageBase64) {
      console.log("Step 2: Generating with reference image...");
      lifestyleImageBase64 = await generateLifestyleImageWithReference(
        productImageBase64,
        referenceImageBase64,
        LOVABLE_API_KEY,
        aspectRatio,
        country,
        productDimensions,
        tvMountInfo
      );
    } else {
      console.log("Step 2: Generating without reference...");
      lifestyleImageBase64 = await generateLifestyleImage(
        productImageBase64,
        LOVABLE_API_KEY,
        aspectRatio,
        country,
        productDimensions,
        tvMountInfo
      );
    }

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
