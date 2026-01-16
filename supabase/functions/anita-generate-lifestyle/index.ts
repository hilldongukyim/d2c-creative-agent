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

async function removeProductBackgroundWithFotor(productImageUrl: string): Promise<string> {
  const FOTOR_API_KEY = Deno.env.get("FOTOR_API_KEY");
  if (!FOTOR_API_KEY) {
    throw new Error("FOTOR_API_KEY is not configured");
  }

  // Create task
  const createResp = await fetch("https://api-b.fotor.com/v1/aiart/backgroundremover", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FOTOR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: productImageUrl }),
  });

  if (!createResp.ok) {
    console.error("Fotor create task error:", createResp.status, await createResp.text());
    throw new Error("Failed to create background removal task");
  }

  const createData = await createResp.json();
  const taskId = createData.data?.taskId as string | undefined;
  if (!taskId) throw new Error("No task ID received from Fotor");

  // Poll
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusResp = await fetch(`https://api-b.fotor.com/v1/aiart/backgroundremover/${taskId}`, {
      headers: { Authorization: `Bearer ${FOTOR_API_KEY}` },
    });

    if (!statusResp.ok) continue;

    const statusData = await statusResp.json();
    const status = statusData.data?.status as string | undefined;

    if (status === "completed" && statusData.data?.resultUrl) {
      const imgResp = await fetch(statusData.data.resultUrl);
      if (!imgResp.ok) throw new Error("Failed to download Fotor result");
      const buf = await imgResp.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(buf)));
    }

    if (status === "failed") {
      throw new Error("Background removal failed");
    }
  }

  throw new Error("Background removal timed out");
}

async function generateEmptyBackgroundFromReference(
  lovableApiKey: string,
  referenceImageBase64: string,
  aspectRatio: string,
  country: string | null,
  tvMountInfo: { mountType: string | null; isTV: boolean } | null
): Promise<string> {
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
    ? `TARGET MARKET: ${country}\nMake the interior style feel authentic for ${country}.`
    : "";

  const tvContext = tvMountInfo?.isTV
    ? "IMPORTANT: The final scene will later include a product; avoid placing any TVs or display-like rectangles on the wall."
    : "";

  const prompt = `You are generating a CLEAN, EMPTY lifestyle BACKGROUND (no product) for later compositing.

GOAL:
- Create a BRAND NEW room scene inspired by the REFERENCE image's style, lighting, and camera angle.
- The output MUST NOT contain any products, appliances, TVs, screens, or branded objects.
- Do NOT recreate the exact reference room; create a new interior with similar mood only.

STYLE TO COPY (ABSTRACT ONLY):
- Camera angle/perspective
- Lighting direction/quality and color temperature
- Interior design aesthetic
- Overall color mood

OUTPUT REQUIREMENTS:
- Resolution exactly ${width}x${height}
- Leave generous EMPTY SPACE in the scene (walls/surfaces) for placing a product later
- Photorealistic, catalog-grade interior photography

${countryContext}
${tvContext}`;

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
    console.error("Gemini background error:", response.status, errorText);
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("CREDIT_EXPIRED");
    throw new Error(`Gemini AI error: ${response.status}`);
  }

  const result = await response.json();
  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) throw new Error("No background image generated");

  const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) throw new Error("Invalid background image format");
  return base64Match[1];
}

async function compositeTransparentProductIntoBackground(
  lovableApiKey: string,
  backgroundBase64: string,
  productTransparentBase64: string,
  productDimensions: { width?: string; height?: string; depth?: string; raw?: string } | null,
  tvMountInfo: { mountType: string | null; isTV: boolean } | null
): Promise<string> {
  const sizeContext = productDimensions?.raw
    ? `\nREAL PRODUCT SIZE: ${productDimensions.raw}\nKeep scale realistic.`
    : "";

  const tvRules = (tvMountInfo?.isTV && tvMountInfo?.mountType)
    ? `\nTV PLACEMENT RULES:\n- Mount type: ${tvMountInfo.mountType}\n- Enforce correct depiction (stand vs wall-mount).`
    : "";

  const prompt = `You are given two images:
1) Background interior scene (FIRST image)
2) A product with transparent background (SECOND image)

TASK:
Composite the product naturally into the background.

STRICT RULES:
- The background scene MUST remain the same (do not replace it with any reference image).
- Place the product at a realistic scale and correct perspective.
- Match lighting direction, shadow softness, and color temperature.
- Add physically plausible contact shadows (and reflections if needed).
- The product must look photographed in the scene, not pasted.
- Do NOT introduce extra products or duplicates.
${sizeContext}
${tvRules}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              image_url: { url: `data:image/png;base64,${backgroundBase64}` },
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${productTransparentBase64}` },
            },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    console.error("Gemini composite error:", resp.status, errorText);
    if (resp.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (resp.status === 402) throw new Error("CREDIT_EXPIRED");
    throw new Error(`Gemini AI error: ${resp.status}`);
  }

  const result = await resp.json();
  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) throw new Error("No composite image generated");

  const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) throw new Error("Invalid composite image format");
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
  console.log(
    "Generating lifestyle image with Gemini...",
    country ? `for ${country}` : "",
    productDimensions ? `with dimensions: ${JSON.stringify(productDimensions)}` : "",
    tvMountInfo ? `TV mount: ${JSON.stringify(tvMountInfo)}` : ""
  );

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

  // Product dimensions context for accurate sizing
  const dimensionsContext = productDimensions
    ? `
PRODUCT PHYSICAL DIMENSIONS:
${productDimensions.raw ? `- Overall size: ${productDimensions.raw}` : ""}
${productDimensions.width ? `- Width: ${productDimensions.width}` : ""}
${productDimensions.height ? `- Height: ${productDimensions.height}` : ""}
${productDimensions.depth ? `- Depth: ${productDimensions.depth}` : ""}

CRITICAL SIZE ACCURACY INSTRUCTIONS:
- Use these exact dimensions to determine the product's real-world scale
- Place the product in the scene with ACCURATE proportions relative to furniture and surroundings
- A 1000mm tall refrigerator should appear roughly human-height in the scene
- A 500mm tall washing machine should appear waist-height when placed on the floor
- Compare product dimensions to standard furniture sizes (sofa ~85cm height, dining table ~75cm height, door ~200cm height)
- The product should look naturally sized - not too large or too small for the space
- Use reference objects in the scene to establish correct scale perception
`
    : "";

  // TV mount type specific instructions
  const tvMountContext = tvMountInfo?.isTV && tvMountInfo?.mountType
    ? `
⚠️ CRITICAL TV PLACEMENT INSTRUCTIONS:
This is a TV product with ${tvMountInfo.mountType === "stand" ? "STAND" : "WALL-MOUNT"} configuration.

${tvMountInfo.mountType === "stand" ? `
**STAND VERSION TV - MANDATORY REQUIREMENTS:**
- The TV MUST be placed on a TV stand, entertainment center, console table, or media cabinet
- The TV stand/base MUST be visible and resting on furniture
- NEVER mount this TV on a wall - it has a stand and must be shown with the stand
- Show the TV sitting on furniture like: TV console, media cabinet, sideboard, or floating shelf unit
- The stand/base of the TV should be clearly visible on the furniture surface
- Typical placement: On a wooden/modern TV unit with the stand feet touching the surface
` : `
**WALL-MOUNT VERSION TV - MANDATORY REQUIREMENTS:**
- The TV MUST be mounted flush against the wall
- NEVER show this TV on a stand or furniture - it is designed for wall mounting
- The TV should appear to float on the wall with minimal gap (zero-gap or slim mount)
- No TV stand or base should be visible
- Below the TV can be a low console for devices, but the TV itself is ON THE WALL
- Create a clean, floating appearance typical of wall-mounted displays
`}

IMPORTANT: Violating these placement rules will result in an incorrect product representation.
The ${tvMountInfo.mountType === "stand" ? "stand-based" : "wall-mounted"} configuration is a key product feature that must be accurately depicted.
`
    : "";

  const countryContext = country
    ? `
TARGET MARKET: ${country}
Create a lifestyle scene that resonates with ${country} consumers:
- Use interior design styles, furniture, and decor typical of ${country} homes
- Reflect the cultural preferences and aesthetic sensibilities of ${country}
- Consider typical home layouts and living spaces in ${country}
- Include elements that feel authentic and aspirational for ${country} market
- If applicable, consider climate and lifestyle patterns typical of ${country}
`
    : "";

  const prompt = `You are a professional lifestyle photographer and product placement specialist.

TASK: Create a stunning lifestyle marketing image at ${width}x${height} resolution (${aspectRatio} aspect ratio).
${tvMountContext}
${dimensionsContext}
${countryContext}

INSTRUCTIONS:
1. Analyze the product in the image.
2. Create a BRAND NEW lifestyle scene where this product looks naturally photographed.
3. Keep the product as the hero, with realistic lighting, shadows, and scale.

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

    console.log("Starting lifestyle image generation for:", imageUrl, "with aspect ratio:", aspectRatio, "country:", country, "dimensions:", productDimensions, "tvMount:", tvMountInfo, "hasReference:", !!referenceImageBase64);

    // Step 1: Download image
    console.log("Step 1: Downloading product image...");
    const productImageBase64 = await downloadImageAsBase64(imageUrl);
    console.log("Image downloaded, length:", productImageBase64.length);

    // Step 2: Generate lifestyle image
    if (referenceImageBase64) {
      console.log("Step 2: Reference mode ON - generating background + compositing product...");

      // 2A) Generate empty background from reference (style only)
      const backgroundBase64 = await generateEmptyBackgroundFromReference(
        LOVABLE_API_KEY,
        referenceImageBase64,
        aspectRatio,
        country,
        tvMountInfo
      );
      console.log("Background generated, length:", backgroundBase64.length);

      // 2B) Remove background from product image (transparent product)
      const productTransparentBase64 = await removeProductBackgroundWithFotor(imageUrl);
      console.log("Product background removed, length:", productTransparentBase64.length);

      // 2C) Composite product into generated background
      const lifestyleImageBase64 = await compositeTransparentProductIntoBackground(
        LOVABLE_API_KEY,
        backgroundBase64,
        productTransparentBase64,
        productDimensions,
        tvMountInfo
      );
      console.log("Lifestyle image (reference pipeline) generated, length:", lifestyleImageBase64.length);

      return new Response(
        JSON.stringify({
          success: true,
          imageBase64: lifestyleImageBase64,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Step 2: Generating lifestyle image with Gemini... without reference");
    const lifestyleImageBase64 = await generateLifestyleImage(productImageBase64, LOVABLE_API_KEY, aspectRatio, country, productDimensions, tvMountInfo);
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
