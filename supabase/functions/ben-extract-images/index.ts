import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CSS selector to match: li.swiper-slide > div.image.c-image > div > img.cmp-image__image.c-image__img
// We'll look for img tags with class "cmp-image__image" or "c-image__img"
function extractImageUrls(html: string): string[] {
  const imageUrls: string[] = [];
  
  // Pattern to find img tags with the target classes
  // Looking for: cmp-image__image and c-image__img classes
  const imgRegex = /<img[^>]*class="[^"]*(?:cmp-image__image|c-image__img)[^"]*"[^>]*src="([^"]+)"[^>]*>/gi;
  const imgRegex2 = /<img[^>]*src="([^"]+)"[^>]*class="[^"]*(?:cmp-image__image|c-image__img)[^"]*"[^>]*>/gi;
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }
  
  while ((match = imgRegex2.exec(html)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }
  
  // Also try a more general pattern for swiper-slide images
  const swiperImgRegex = /<li[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  while ((match = swiperImgRegex.exec(html)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }
  
  console.log("Found image URLs:", imageUrls.length);
  return imageUrls;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Firecrawl API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Extracting images from URL:", url);

    // Get rawHtml to parse for images
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["rawHtml"],
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firecrawl API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to scrape URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error("Firecrawl scrape failed:", data);
      return new Response(JSON.stringify({ error: "Scrape failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = data.data?.rawHtml || "";
    console.log("HTML length:", html.length);
    
    const imageUrls = extractImageUrls(html);
    
    // Return the first image found (for the swiper gallery)
    const firstImage = imageUrls[0] || null;
    
    console.log("First image URL:", firstImage);

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: firstImage,
      allImageUrls: imageUrls.slice(0, 5), // Return up to 5 images
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ben-extract-images:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Extract failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
