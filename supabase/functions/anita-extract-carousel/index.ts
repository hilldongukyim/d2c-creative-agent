import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract all carousel images from HTML
function extractAllCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // Pattern 1: swiper-slide images
  const swiperRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = swiperRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      seen.add(src);
      images.push(src.startsWith('http') ? src : new URL(src, baseUrl).href);
    }
  }

  // Pattern 2: cmp-carousel__item images
  const carouselRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/gi;
  while ((match = carouselRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      seen.add(src);
      images.push(src.startsWith('http') ? src : new URL(src, baseUrl).href);
    }
  }

  // Pattern 3: data-srcset or srcset attributes (for lazy-loaded images)
  const srcsetRegex = /(?:data-)?srcset="([^"]+)"/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const srcset = match[1];
    // Get the largest image from srcset
    const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
    sources.forEach(src => {
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
        // Filter for product images (usually larger than thumbnails)
        if (src.includes('/product/') || src.includes('/gallery/') || src.includes('pdp')) {
          seen.add(src);
          images.push(src.startsWith('http') ? src : new URL(src, baseUrl).href);
        }
      }
    });
  }

  // Pattern 4: General product gallery images
  const galleryRegex = /<img[^>]*(?:class="[^"]*(?:gallery|product|carousel)[^"]*")?[^>]*src="([^"]+)"[^>]*>/gi;
  while ((match = galleryRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
      // Filter for likely product images
      if (src.includes('/product/') || src.includes('/gallery/') || src.includes('pdp') || 
          src.includes('image') && (src.includes('.png') || src.includes('.jpg') || src.includes('.webp'))) {
        seen.add(src);
        images.push(src.startsWith('http') ? src : new URL(src, baseUrl).href);
      }
    }
  }

  console.log(`Found ${images.length} unique carousel images`);
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
        waitFor: 5000, // Wait longer for JS rendering
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

    const images = extractAllCarouselImages(html, url);
    console.log("Extracted images:", images);

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
