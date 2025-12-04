import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CSS selector to match: #swiper-wrapper-* > div.cmp-carousel__item.swiper-slide > div > div > div > img
function extractImageUrls(html: string): string[] {
  const imageUrls: string[] = [];
  
  // Pattern 1: Find img tags inside cmp-carousel__item swiper-slide divs
  const carouselImgRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  
  let match;
  while ((match = carouselImgRegex.exec(html)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      // Filter out SVG logos and small icons
      if (!match[1].includes('logo') && !match[1].endsWith('.svg')) {
        imageUrls.push(match[1]);
      }
    }
  }
  
  // Pattern 2: Look for swiper-slide with c-carousel__item class
  const carouselImgRegex2 = /<div[^>]*class="[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  while ((match = carouselImgRegex2.exec(html)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      if (!match[1].includes('logo') && !match[1].endsWith('.svg')) {
        imageUrls.push(match[1]);
      }
    }
  }
  
  // Pattern 3: General swiper-slide pattern as fallback
  const swiperImgRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  while ((match = swiperImgRegex.exec(html)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      if (!match[1].includes('logo') && !match[1].endsWith('.svg')) {
        imageUrls.push(match[1]);
      }
    }
  }
  
  console.log("Found image URLs:", imageUrls.length);
  console.log("First few URLs:", imageUrls.slice(0, 3));
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
