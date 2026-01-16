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

async function generateLifestyleImage(
  productImageBase64: string, 
  lovableApiKey: string, 
  aspectRatio: string = "16:9", 
  country: string | null = null,
  productDimensions: { width?: string; height?: string; depth?: string; raw?: string } | null = null,
  tvMountInfo: { mountType: string | null; isTV: boolean } | null = null,
  referenceImageBase64: string | null = null
): Promise<string> {
  console.log("Generating lifestyle image with Gemini...", country ? `for ${country}` : "", productDimensions ? `with dimensions: ${JSON.stringify(productDimensions)}` : "", tvMountInfo ? `TV mount: ${JSON.stringify(tvMountInfo)}` : "", referenceImageBase64 ? "with reference image" : "");

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
  const dimensionsContext = productDimensions ? `
PRODUCT PHYSICAL DIMENSIONS:
${productDimensions.raw ? `- Overall size: ${productDimensions.raw}` : ''}
${productDimensions.width ? `- Width: ${productDimensions.width}` : ''}
${productDimensions.height ? `- Height: ${productDimensions.height}` : ''}
${productDimensions.depth ? `- Depth: ${productDimensions.depth}` : ''}

CRITICAL SIZE ACCURACY INSTRUCTIONS:
- Use these exact dimensions to determine the product's real-world scale
- Place the product in the scene with ACCURATE proportions relative to furniture and surroundings
- A 1000mm tall refrigerator should appear roughly human-height in the scene
- A 500mm tall washing machine should appear waist-height when placed on the floor
- Compare product dimensions to standard furniture sizes (sofa ~85cm height, dining table ~75cm height, door ~200cm height)
- The product should look naturally sized - not too large or too small for the space
- Use reference objects in the scene to establish correct scale perception
` : '';

  // TV mount type specific instructions
  const tvMountContext = (tvMountInfo?.isTV && tvMountInfo?.mountType) ? `
⚠️ CRITICAL TV PLACEMENT INSTRUCTIONS:
This is a TV product with ${tvMountInfo.mountType === 'stand' ? 'STAND' : 'WALL-MOUNT'} configuration.

${tvMountInfo.mountType === 'stand' ? `
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
The ${tvMountInfo.mountType === 'stand' ? 'stand-based' : 'wall-mounted'} configuration is a key product feature that must be accurately depicted.
` : '';
  const countryContext = country ? `
TARGET MARKET: ${country}
Create a lifestyle scene that resonates with ${country} consumers:
- Use interior design styles, furniture, and decor typical of ${country} homes
- Reflect the cultural preferences and aesthetic sensibilities of ${country}
- Consider typical home layouts and living spaces in ${country}
- Include elements that feel authentic and aspirational for ${country} market
- If applicable, consider climate and lifestyle patterns typical of ${country}

For example:
- South Korea: Modern minimalist apartments, ondol floor heating, compact but stylish spaces
- Japan: Clean, organized spaces with natural materials, zen-like simplicity
- United States: Spacious open-concept homes, casual comfortable lifestyle
- Germany: Functional, efficient design with quality craftsmanship
- United Kingdom: Mix of traditional and modern, cozy home atmosphere
- France: Elegant, sophisticated interiors with classic touches
- Italy: Warm Mediterranean aesthetics, stylish and artistic
- Brazil: Vibrant colors, tropical elements, warm family-oriented spaces
- India: Rich colors and textures, blend of traditional and modern
- China: Balance of contemporary and traditional Chinese elements
- Middle East (UAE, Saudi Arabia): Luxurious, opulent interiors
- Australia: Indoor-outdoor living, bright natural light
` : '';

  // Reference image context
  const referenceContext = referenceImageBase64 ? `
⚠️ CRITICAL - TWO IMAGES ARE PROVIDED:
- **IMAGE 1 (PRODUCT IMAGE)**: This is the ACTUAL PRODUCT that MUST appear in the final image. This product is the HERO and MAIN SUBJECT.
- **IMAGE 2 (REFERENCE IMAGE)**: This is ONLY for STYLE REFERENCE. Do NOT include any objects, furniture, or elements from this image in the output.

REFERENCE IMAGE - STYLE EXTRACTION ONLY:
From the reference image, ONLY extract and apply these ABSTRACT QUALITIES:
1. **Camera Angle/Perspective**: The viewing angle (eye-level, low angle, high angle, etc.)
2. **Lighting Direction & Quality**: Where light comes from, hard vs soft shadows, warm vs cool tones
3. **Interior Design Style**: The general aesthetic (modern, minimalist, Scandinavian, industrial, luxurious, etc.)
4. **Color Mood**: The overall color temperature and palette feeling
5. **Spatial Depth**: How deep/shallow the room appears

⛔ ABSOLUTELY DO NOT:
- Copy or recreate the exact room from the reference image
- Include any furniture or objects visible in the reference image  
- Use the reference image as a background or composite base
- Place the product INTO the reference image scene

✅ INSTEAD, YOU MUST:
- Create a COMPLETELY NEW and ORIGINAL room/environment
- Design NEW furniture and decorations that match the STYLE (not the actual items)
- Place the PRODUCT from Image 1 as the central hero in this NEW scene
- The reference is like a "mood board" - inspire the FEELING, not the CONTENT
` : '';

  const prompt = `You are a professional lifestyle photographer and product placement specialist.

${referenceImageBase64 ? `
🔴 CRITICAL INSTRUCTION - READ CAREFULLY:
You are receiving TWO images:
1. FIRST IMAGE = THE PRODUCT (must be prominently featured in your output)
2. SECOND IMAGE = STYLE REFERENCE ONLY (do NOT copy this scene, only learn from its style)

Your task: Create a BRAND NEW lifestyle scene featuring the PRODUCT from Image 1, 
while being INSPIRED BY (not copying) the style/mood/angle from Image 2.
` : ''}

TASK: Create a stunning lifestyle marketing image at ${width}x${height} resolution (${aspectRatio} aspect ratio).
${tvMountContext}
${dimensionsContext}
${countryContext}
${referenceContext}
INSTRUCTIONS:
1. Identify the product from the FIRST image - this is your HERO product that MUST appear in the final output
${referenceImageBase64 ? '2. From the SECOND (reference) image, extract ONLY: camera angle, lighting style, interior design aesthetic, and color mood' : ''}
${referenceImageBase64 ? '3. Create a COMPLETELY NEW room/environment that FEELS similar to the reference but is NOT the same room' : ''}
${referenceImageBase64 ? '4' : '2'}. Place the product naturally in this ${referenceImageBase64 ? 'newly created' : 'appropriate'} environment
${referenceImageBase64 ? '5' : '3'}. Ensure the product is the focal point and clearly visible

Scene Requirements:
- Professional photography quality
- ${referenceImageBase64 ? 'Camera angle inspired by reference image' : 'Appropriate camera angle for the product type'}
- ${referenceImageBase64 ? 'Lighting style matching reference mood' : 'Natural, realistic lighting with subtle shadows'}
- Product should be clearly visible and prominently featured
- ${referenceImageBase64 ? 'Interior style inspired by (NOT copied from) the reference' : 'Background should complement the product'}
- Color harmony between product and environment
${productDimensions ? '- Product scale must be realistic relative to surrounding furniture and space' : ''}

Generate the lifestyle image now featuring the PRODUCT from Image 1 in a NEW scene${referenceImageBase64 ? ' inspired by the STYLE of Image 2' : ''}.`;

  // Build the content array with product image and optionally reference image
  const contentArray: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
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
  ];

  // Add reference image if provided
  if (referenceImageBase64) {
    contentArray.push({
      type: "image_url",
      image_url: {
        url: `data:image/png;base64,${referenceImageBase64}`,
      },
    });
  }

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
          content: contentArray,
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini AI error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("CREDIT_EXPIRED");
    }
    throw new Error(`Gemini AI error: ${response.status}`);
  }

  const result = await response.json();
  console.log("Gemini AI response received");

  const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) {
    throw new Error("No image generated from Gemini AI");
  }

  // Extract base64 from data URL
  const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) {
    throw new Error("Invalid image format from Gemini AI");
  }

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

    // Step 2: Generate lifestyle image with Gemini
    console.log("Step 2: Generating lifestyle image with Gemini...", referenceImageBase64 ? "with reference image" : "without reference");
    const lifestyleImageBase64 = await generateLifestyleImage(productImageBase64, LOVABLE_API_KEY, aspectRatio, country, productDimensions, tvMountInfo, referenceImageBase64);
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
