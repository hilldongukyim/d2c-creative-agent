import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidExternalUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') return { valid: false, error: "Only HTTPS URLs are allowed" };
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return { valid: false, error: "Localhost URLs are not allowed" };
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b] = ipv4Match.map(Number);
      if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || a === 127) {
        return { valid: false, error: "Private IP addresses are not allowed" };
      }
    }
    if (hostname === '169.254.169.254' || hostname.includes('metadata')) return { valid: false, error: "Metadata endpoints are not allowed" };
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  return base64Encode(new Uint8Array(arrayBuffer));
}

async function removeBackground(imageUrl: string, apiKey: string): Promise<string> {
  console.log("Processing image with Remove.bg:", imageUrl.substring(0, 80));
  const imageBase64 = await downloadImageAsBase64(imageUrl);

  const formData = new FormData();
  formData.append('image_file_b64', imageBase64);
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Remove.bg API error:", response.status, errorText);
    throw new Error(`Remove.bg API error: ${response.status}`);
  }

  const resultBuffer = await response.arrayBuffer();
  const resultBase64 = base64Encode(new Uint8Array(resultBuffer));
  return `data:image/png;base64,${resultBase64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 2 || imageUrls.length > 6) {
      return new Response(JSON.stringify({ error: "2-6 image URLs are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate all URLs
    for (let i = 0; i < imageUrls.length; i++) {
      const validation = isValidExternalUrl(imageUrls[i]);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: `Image ${i + 1}: ${validation.error}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const REMOVE_BG_API_KEY = Deno.env.get("REMOVE_BG_API_KEY");
    if (!REMOVE_BG_API_KEY) {
      throw new Error("REMOVE_BG_API_KEY not configured");
    }

    console.log(`Processing ${imageUrls.length} images sequentially...`);

    const processedImages: Array<{ originalUrl: string; base64: string; index: number }> = [];

    for (let i = 0; i < imageUrls.length; i++) {
      console.log(`Processing image ${i + 1}/${imageUrls.length}...`);
      try {
        const base64 = await removeBackground(imageUrls[i], REMOVE_BG_API_KEY);
        processedImages.push({ originalUrl: imageUrls[i], base64, index: i });
      } catch (err) {
        console.error(`Failed to process image ${i + 1}:`, err);
        // Fallback: use original URL (frontend will handle)
        processedImages.push({ originalUrl: imageUrls[i], base64: imageUrls[i], index: i });
      }

      // Rate limit delay between calls (skip after last)
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`All ${processedImages.length} images processed`);

    return new Response(JSON.stringify({
      success: true,
      processedImages,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ben-process-images:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Processing failed",
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
