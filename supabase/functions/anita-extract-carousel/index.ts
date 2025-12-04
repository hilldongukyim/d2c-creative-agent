import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract ALL carousel images from div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("Starting image extraction...");
  console.log("Target: div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img");

  const addImage = (src: string, source: string) => {
    if (!src || seen.has(src)) return false;
    if (src.includes('logo') || src.endsWith('.svg')) return false;
    if (src.includes('thum-') || src.includes('thumbnail')) return false;
    if (src.includes('180x180') || src.includes('100x100') || src.includes('450x450')) return false;
    if (src.includes('placeholder') || src.includes('loading')) return false;
    
    seen.add(src);
    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
    images.push(fullUrl);
    console.log(`Found image [${images.length}] (${source}):`, fullUrl.substring(0, 150));
    return true;
  };

  // Primary Strategy: Find ALL divs with classes cmp-carousel__item + swiper-slide + c-carousel__item
  // Then extract img from nested div > div > div > img structure
  // Class order may vary, so we check for all three classes regardless of order
  
  // Split HTML into potential carousel item blocks
  const carouselItemRegex = /<div[^>]*class="([^"]*cmp-carousel__item[^"]*)"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*cmp-carousel__item|<\/section>|<section|$)/gi;
  let itemMatch;
  
  while ((itemMatch = carouselItemRegex.exec(html)) !== null) {
    const classAttr = itemMatch[1];
    const content = itemMatch[2];
    
    // Check if this div has all required classes
    if (classAttr.includes('swiper-slide') && classAttr.includes('c-carousel__item')) {
      console.log("Found carousel item with matching classes");
      
      // Look for img inside div > div > div > img pattern
      // The img can have src or data-src attribute
      const nestedImgRegex = /<div[^>]*>\s*<div[^>]*>\s*<div[^>]*>\s*<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
      let imgMatch;
      
      while ((imgMatch = nestedImgRegex.exec(content)) !== null) {
        addImage(imgMatch[1], 'nested-div-img');
      }
      
      // Also try direct img search within the carousel item (fallback)
      if (images.length === 0) {
        const directImgRegex = /<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
        let directMatch;
        while ((directMatch = directImgRegex.exec(content)) !== null) {
          addImage(directMatch[1], 'direct-img');
        }
      }
    }
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from carousel items`);
    return images;
  }

  // Fallback Strategy: Simpler regex for swiper-slide with c-carousel__item
  console.log("Trying fallback strategy...");
  const fallbackRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
  let fallbackMatch;
  
  while ((fallbackMatch = fallbackRegex.exec(html)) !== null) {
    addImage(fallbackMatch[1], 'fallback');
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from fallback pattern`);
    return images;
  }

  // Last resort: Look for any swiper-slide images in first half of page
  console.log("Trying last resort strategy...");
  const firstHalf = html.substring(0, Math.floor(html.length / 2));
  const lastResortRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"[^>]*>/gi;
  let lastMatch;
  
  while ((lastMatch = lastResortRegex.exec(firstHalf)) !== null) {
    const src = lastMatch[1];
    if (!src.includes('usp') && !src.includes('USP') && !src.includes('feature') && !src.includes('icon')) {
      addImage(src, 'last-resort');
    }
  }

  console.log(`Total images extracted: ${images.length}`);
  return images;
}

// Extract product name from HTML
function extractProductName(html: string, url: string): string {
  const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                       html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
  if (ogTitleMatch) {
    console.log("Found og:title:", ogTitleMatch[1]);
    return cleanProductName(ogTitleMatch[1]);
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    console.log("Found title:", titleMatch[1]);
    return cleanProductName(titleMatch[1]);
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    console.log("Found h1:", h1Match[1]);
    return cleanProductName(h1Match[1]);
  }

  const urlParts = url.split('/').filter(p => p && !p.includes('www.') && !p.includes('.com'));
  const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || 'product';
  return cleanProductName(lastPart.replace(/-/g, ' '));
}

function cleanProductName(name: string): string {
  return name
    .replace(/\s*[|\-–—]\s*LG.*$/i, '')
    .replace(/\s*[|\-–—]\s*Buy.*$/i, '')
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50)
    .trim() || 'product';
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
        waitFor: 10000,
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
    const productName = extractProductName(html, url);
    console.log("Extracted product name:", productName);
    console.log("Total images extracted:", images.length);

    return new Response(JSON.stringify({
      success: true,
      images: images,
      productName: productName,
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
