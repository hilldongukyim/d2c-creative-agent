import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract carousel images using specific CSS selector pattern
// Target: #swiper-wrapper-* > div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("Starting image extraction with specific selector pattern...");

  const addImage = (src: string, source: string) => {
    if (!src || seen.has(src)) return false;
    if (src.includes('logo') || src.endsWith('.svg')) return false;
    if (src.includes('thum-') || src.includes('thumbnail')) return false;
    if (src.includes('180x180') || src.includes('100x100') || src.includes('450x450')) return false;
    if (src.includes('placeholder') || src.includes('loading')) return false;
    
    seen.add(src);
    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
    images.push(fullUrl);
    console.log(`Found image (${source}):`, fullUrl.substring(0, 150));
    return true;
  };

  // Strategy 1: Find first swiper-wrapper and extract ALL carousel item images
  // Pattern: #swiper-wrapper-* > div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
  const swiperWrapperMatch = html.match(/<div[^>]*id="swiper-wrapper-[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div[^>]*class="[^"]*swiper-button/i);
  
  if (swiperWrapperMatch) {
    console.log("Found swiper-wrapper with button boundary");
    const wrapperContent = swiperWrapperMatch[1];
    
    // Find all divs with the specific class combination
    const itemRegex = /<div[^>]*class="cmp-carousel__item\s+swiper-slide\s+c-carousel__item[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="cmp-carousel__item\s+swiper-slide|$)/gi;
    let itemMatch;
    
    while ((itemMatch = itemRegex.exec(wrapperContent)) !== null) {
      // Find img inside nested div > div > div > img
      const imgMatch = itemMatch[1].match(/<div[^>]*>\s*<div[^>]*>\s*<div[^>]*>\s*<img[^>]*(?:data-src|src)="([^"]+)"/i);
      if (imgMatch) {
        addImage(imgMatch[1], 'exact-pattern');
      }
    }
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from exact swiper pattern`);
    return images;
  }

  // Strategy 2: Alternative - find all cmp-carousel__item with swiper-slide and c-carousel__item classes
  const altRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:data-src|src)="([^"]+)"[^>]*>/gi;
  let altMatch;
  
  while ((altMatch = altRegex.exec(html)) !== null) {
    addImage(altMatch[1], 'alt-carousel');
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from alternative carousel pattern`);
    return images;
  }

  // Strategy 2: Alternative pattern - look for swiper-slide with c-carousel__item class
  const altCarouselRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:data-src|src)="([^"]+)"[^>]*>/gi;
  let altMatch;
  
  while ((altMatch = altCarouselRegex.exec(html)) !== null) {
    addImage(altMatch[1], 'alt-carousel');
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from alternative carousel pattern`);
    return images;
  }

  // Strategy 3: Look for LG's picture elements with srcset (for responsive images)
  const pictureRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*"[^>]*>[\s\S]*?<picture[^>]*>[\s\S]*?<source[^>]*srcset="([^"]+)"[\s\S]*?<\/picture>/gi;
  let pictureMatch;
  
  while ((pictureMatch = pictureRegex.exec(html)) !== null) {
    const srcset = pictureMatch[1];
    const srcsetParts = srcset.split(',').map(s => s.trim());
    const lastSrc = srcsetParts[srcsetParts.length - 1]?.split(' ')[0];
    if (lastSrc) {
      addImage(lastSrc, 'carousel-picture');
    }
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from carousel picture elements`);
    return images;
  }

  // Strategy 4: Broader swiper-slide search in first portion
  const firstHalf = html.substring(0, Math.floor(html.length / 2));
  const broadSwiperRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:data-src|src)="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"[^>]*>/gi;
  let broadMatch;
  
  while ((broadMatch = broadSwiperRegex.exec(firstHalf)) !== null) {
    const src = broadMatch[1];
    // Filter out non-product images
    if (!src.includes('usp') && !src.includes('USP') && !src.includes('feature') && !src.includes('icon')) {
      addImage(src, 'broad-swiper');
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
        waitFor: 10000, // Wait for dynamic carousel to load
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
