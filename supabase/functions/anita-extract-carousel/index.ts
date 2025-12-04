import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract all carousel images matching the specific selector pattern:
// #swiper-wrapper-* > div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // Pattern to match the specific carousel structure
  // Looking for: swiper-wrapper containing cmp-carousel__item with swiper-slide and c-carousel__item classes
  const carouselRegex = /<div[^>]*id="swiper-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  
  // Find all swiper-slide items with the specific class combination
  const slideRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi;
  
  let match;
  
  // Method 1: Look for the nested img structure within carousel items
  const imgInCarouselRegex = /<div[^>]*class="[^"]*(?:cmp-carousel__item|swiper-slide|c-carousel__item)[^"]*"[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<div[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  
  while ((match = imgInCarouselRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      seen.add(src);
      const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
      images.push(fullUrl);
      console.log("Found carousel image (method 1):", fullUrl);
    }
  }

  // Method 2: More flexible pattern for swiper slides with images
  const swiperSlideImgRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  
  while ((match = swiperSlideImgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      seen.add(src);
      const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
      images.push(fullUrl);
      console.log("Found carousel image (method 2):", fullUrl);
    }
  }

  // Method 3: Look for data-src attributes (lazy loaded images)
  const dataSrcRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*data-src="([^"]+)"[^>]*>/gi;
  
  while ((match = dataSrcRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      seen.add(src);
      const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
      images.push(fullUrl);
      console.log("Found carousel image (method 3 - data-src):", fullUrl);
    }
  }

  // Method 4: Extract all images from cmp-carousel__item containers
  const cmpCarouselImgRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
  
  while ((match = cmpCarouselImgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      seen.add(src);
      const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
      images.push(fullUrl);
      console.log("Found carousel image (method 4):", fullUrl);
    }
  }

  console.log(`Total unique carousel images found: ${images.length}`);
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

    console.log("Extracting carousel images from URL:", url);

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
