import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract ALL carousel images from the FIRST swiper-wrapper only (main product gallery)
// Target: #swiper-wrapper-* > div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("=== Starting image extraction ===");

  const addImage = (src: string, source: string) => {
    if (!src || seen.has(src)) return false;
    // Skip non-product images
    if (src.includes('logo') || src.endsWith('.svg')) return false;
    if (src.includes('thum-') || src.includes('thumbnail')) return false;
    if (src.includes('180x180') || src.includes('100x100')) return false;
    if (src.includes('placeholder') || src.includes('loading')) return false;
    if (src.includes('qrcode') || src.includes('qr-code') || src.includes('QR')) return false;
    if (src.includes('icon') || src.includes('badge') || src.includes('flag')) return false;
    
    seen.add(src);
    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
    images.push(fullUrl);
    console.log(`✓ Image [${images.length}]:`, fullUrl.substring(0, 120));
    return true;
  };

  // Step 1: Find the FIRST swiper-wrapper section (main product gallery)
  // The ID pattern is: swiper-wrapper-XXXXXXX
  const swiperWrapperMatch = html.match(/<div[^>]*id="(swiper-wrapper-[^"]+)"[^>]*class="swiper-wrapper"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*swiper-pagination|<div[^>]*class="[^"]*swiper-button|<\/div>\s*<\/div>\s*<\/div>)/i);
  
  if (swiperWrapperMatch) {
    const wrapperId = swiperWrapperMatch[1];
    const wrapperContent = swiperWrapperMatch[2];
    console.log(`Found swiper-wrapper: #${wrapperId}`);
    console.log(`Wrapper content length: ${wrapperContent.length}`);
    
    // Step 2: Find all carousel items with class pattern: cmp-carousel__item swiper-slide c-carousel__item
    const itemMatches = wrapperContent.matchAll(/<div[^>]*class="cmp-carousel__item[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="cmp-carousel__item[^"]*swiper-slide|$)/gi);
    
    let itemCount = 0;
    for (const itemMatch of itemMatches) {
      itemCount++;
      const itemContent = itemMatch[1];
      
      // Step 3: Extract img from this carousel item
      // Try multiple patterns:
      
      // Pattern A: Direct img with src or data-src (most common)
      const imgMatches = itemContent.matchAll(/<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi);
      for (const imgMatch of imgMatches) {
        addImage(imgMatch[1], `item-${itemCount}`);
      }
      
      // Pattern B: Picture element with source srcset
      const pictureMatches = itemContent.matchAll(/<picture[^>]*>[\s\S]*?<source[^>]*srcset="([^"]+)"[\s\S]*?<\/picture>/gi);
      for (const picMatch of pictureMatches) {
        const srcset = picMatch[1];
        // Get the last (highest res) image from srcset
        const srcsetParts = srcset.split(',').map(s => s.trim());
        const highResSrc = srcsetParts[srcsetParts.length - 1]?.split(' ')[0];
        if (highResSrc) {
          addImage(highResSrc, `item-${itemCount}-picture`);
        }
      }
    }
    
    console.log(`Processed ${itemCount} carousel items`);
    
    if (images.length > 0) {
      console.log(`=== Found ${images.length} product images ===`);
      return images;
    }
  } else {
    console.log("No swiper-wrapper with class found, trying alternative...");
  }

  // Fallback: Try to find swiper-wrapper by ID only
  const altMatch = html.match(/<div[^>]*id="swiper-wrapper-[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*id="swiper-wrapper-|<div[^>]*class="[^"]*swiper-pagination)/i);
  
  if (altMatch) {
    console.log("Found swiper-wrapper by ID pattern");
    const content = altMatch[1];
    
    // Find all img elements within
    const allImgs = content.matchAll(/<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi);
    for (const img of allImgs) {
      addImage(img[1], 'fallback-img');
    }
    
    if (images.length > 0) {
      console.log(`=== Found ${images.length} images via fallback ===`);
      return images;
    }
  }

  // Last resort: Find images in any cmp-carousel__item in the first quarter of the page
  console.log("Trying last resort: first quarter of page...");
  const firstQuarter = html.substring(0, Math.floor(html.length / 4));
  const lastResortMatches = firstQuarter.matchAll(/<div[^>]*class="[^"]*cmp-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi);
  
  for (const match of lastResortMatches) {
    addImage(match[1], 'last-resort');
  }

  console.log(`=== Total images: ${images.length} ===`);
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
    return cleanProductName(titleMatch[1]);
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
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
        waitFor: 12000, // Increased wait time
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
