import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract carousel images from the specific gallery selector:
// #swiper-wrapper-* > div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // Find the swiper-wrapper container and extract images from it
  // Pattern: swiper-wrapper containing divs with all three classes: cmp-carousel__item, swiper-slide, c-carousel__item
  const swiperWrapperRegex = /<div[^>]*id="swiper-wrapper-[^"]*"[^>]*class="[^"]*swiper-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*swiper-button|<\/div>)/gi;
  
  const wrapperMatch = swiperWrapperRegex.exec(html);
  
  if (wrapperMatch) {
    const wrapperContent = wrapperMatch[1];
    console.log("Found swiper-wrapper content, length:", wrapperContent.length);
    
    // Extract images from slides that have all required classes
    const slideImgRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
    
    let match;
    while ((match = slideImgRegex.exec(wrapperContent)) !== null) {
      const src = match[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
        seen.add(src);
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push(fullUrl);
        console.log("Found gallery image:", fullUrl);
      }
    }
  }
  
  // Fallback: If no images found, try a more direct approach
  if (images.length === 0) {
    console.log("Trying fallback extraction...");
    
    // Look for the specific class combination pattern
    const fallbackRegex = /<div[^>]*class="(?:[^"]*\s)?cmp-carousel__item(?:\s[^"]*)?swiper-slide(?:\s[^"]*)?c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
    
    let match;
    while ((match = fallbackRegex.exec(html)) !== null) {
      const src = match[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
        seen.add(src);
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push(fullUrl);
        console.log("Found gallery image (fallback):", fullUrl);
      }
    }
  }

  // Second fallback: Match class order variations
  if (images.length === 0) {
    console.log("Trying second fallback...");
    
    // Classes might be in different order
    const patterns = [
      /<div[^>]*class="[^"]*c-carousel__item[^"]*cmp-carousel__item[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi,
      /<div[^>]*class="[^"]*swiper-slide[^"]*cmp-carousel__item[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const src = match[1];
        if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
          seen.add(src);
          const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
          images.push(fullUrl);
          console.log("Found gallery image (fallback 2):", fullUrl);
        }
      }
      if (images.length > 0) break;
    }
  }

  console.log(`Total gallery images found: ${images.length}`);
  return images;
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

    console.log("Extracting gallery carousel images from URL:", url);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["rawHtml"],
        waitFor: 5000,
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

    const images = extractCarouselImages(html, url);

    return new Response(JSON.stringify({
      success: true,
      images: images,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in anita-extract-carousel:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Extract failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
