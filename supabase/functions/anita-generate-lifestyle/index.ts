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
- **IMAGE 1 (PRODUCT IMAGE)**: This is the ACTUAL PRODUCT that MUST appear in the final image. Extract ONLY the product object itself.
- **IMAGE 2 (REFERENCE IMAGE)**: This is ONLY for STYLE REFERENCE. Extract ONLY the abstract style qualities - NO objects or products from this image should appear in output.

🚨 MANDATORY: REMOVE ANY PRODUCTS FROM REFERENCE IMAGE
If the reference image contains any products (TV, appliances, electronics, furniture items being sold), you MUST:
- IGNORE those products completely
- DO NOT include them in the output
- ONLY use the reference for: room style, lighting, camera angle, color mood
- The ONLY product in the final image should be from IMAGE 1

REFERENCE IMAGE - EXTRACT ONLY THESE ABSTRACT QUALITIES:
1. **Camera Angle/Perspective**: The viewing angle and composition style
2. **Lighting**: Light direction, quality (soft/hard), color temperature (warm/cool)
3. **Interior Design Aesthetic**: Modern, minimalist, Scandinavian, luxurious, etc.
4. **Color Palette Mood**: Overall color feeling and harmony
5. **Room Atmosphere**: Cozy, professional, airy, dramatic, etc.

⛔ ABSOLUTELY DO NOT:
- Include ANY products or appliances from the reference image
- Copy the exact room layout or furniture placement
- Use reference image as a background to paste product onto
- Keep any branded items or specific objects from reference

✅ YOU MUST:
- Create a COMPLETELY NEW room environment from scratch
- Design NEW furniture that matches the STYLE aesthetic (not same items)
- Seamlessly integrate the PRODUCT from Image 1 into this new scene
- Make the product look like it BELONGS in this environment naturally
- Match lighting on the product to the environment lighting
` : '';

  const prompt = `You are a professional lifestyle photographer and product placement specialist.

${referenceImageBase64 ? `
🔴 ABSOLUTELY CRITICAL - READ THIS FIRST:
You are receiving TWO images but they serve DIFFERENT purposes:

📦 IMAGE 1 = THE PRODUCT TO FEATURE
- This is the ONLY product that should appear in your output
- Extract this product and place it naturally in a new scene

🎨 IMAGE 2 = STYLE MOOD BOARD (NOT a scene to copy)
- Use this ONLY to understand: lighting style, camera angle, interior aesthetic, color mood
- DO NOT copy this room. DO NOT include any products visible in this image.
- If there's a TV, appliance, or any product in the reference - REMOVE IT from your output

YOUR OUTPUT: A brand new lifestyle scene where the product from Image 1 is seamlessly placed
in a newly created environment that captures the STYLE FEELING of Image 2.
` : ''}

TASK: Create a stunning lifestyle marketing image at ${width}x${height} resolution (${aspectRatio} aspect ratio).
${tvMountContext}
${dimensionsContext}
${countryContext}
${referenceContext}
INSTRUCTIONS:
1. From IMAGE 1: Extract the product - this is your HERO that MUST appear in the final output
${referenceImageBase64 ? '2. From IMAGE 2: Extract ONLY the style elements (lighting, angle, aesthetic, mood) - IGNORE any products in this image' : ''}
${referenceImageBase64 ? '3. Create a BRAND NEW room/environment inspired by the style (not copied)' : ''}
${referenceImageBase64 ? '4' : '2'}. Place the product NATURALLY in this environment with SEAMLESS INTEGRATION:
   - Match the lighting on the product to the environment
   - Ensure proper shadows and reflections
   - Product should look like it was photographed IN this scene, not pasted on
   - Correct perspective and scale relative to surroundings
${referenceImageBase64 ? '5' : '3'}. Ensure the product is the focal point and clearly visible

SEAMLESS COMPOSITING REQUIREMENTS:
- The product must have consistent lighting with the environment
- Shadows beneath/behind product must match the scene's light direction
- Product edges should blend naturally (no harsh cutout appearance)
- Reflections on glossy surfaces should match environment
- Product scale must be realistic relative to furniture/room size

Scene Requirements:
- Professional photography quality (like a catalog shoot)
- ${referenceImageBase64 ? 'Camera angle inspired by reference' : 'Appropriate camera angle'}
- ${referenceImageBase64 ? 'Lighting matching reference mood' : 'Natural, realistic lighting'}
- Product as the clear hero and focal point
- ${referenceImageBase64 ? 'NEW environment inspired by (NOT copied from) reference' : 'Complementary background'}
- Color harmony between product and environment
${productDimensions ? '- Product scale realistic based on actual dimensions' : ''}
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
