import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract ONLY the FIRST/TOP product gallery carousel images
// Target: div.cmp-carousel__item.swiper-slide.c-carousel__item > div > div > div > img
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("=== Extracting TOP gallery images only ===");

  const addImage = (src: string, source: string) => {
    if (!src || seen.has(src)) return false;
    
    // Skip non-product images
    if (src.includes('logo') || src.endsWith('.svg')) return false;
    if (src.includes('thum-') || src.includes('thumbnail')) return false;
    if (src.includes('180x180') || src.includes('100x100') || src.includes('450x450')) return false;
    if (src.includes('placeholder') || src.includes('loading')) return false;
    if (src.includes('qrcode') || src.includes('qr-code') || src.includes('QR')) return false;
    if (src.includes('icon') || src.includes('badge') || src.includes('flag')) return false;
    
    // CRITICAL: Skip feature/USP promotional images
    if (src.includes('/features/')) return false;
    if (src.includes('/usp/') || src.includes('/USP/')) return false;
    if (src.includes('-feature') || src.includes('_feature')) return false;
    
    seen.add(src);
    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
    images.push(fullUrl);
    console.log(`✓ Gallery Image [${images.length}]:`, fullUrl.substring(0, 150));
    return true;
  };

  // Strategy: Find the FIRST swiper-wrapper in the HTML (this is the main product gallery)
  // Look for the first occurrence of swiper-wrapper with carousel items
  
  // Find position of first swiper-wrapper
  const firstSwiperPos = html.indexOf('id="swiper-wrapper-');
  if (firstSwiperPos === -1) {
    console.log("No swiper-wrapper found");
    return images;
  }

  console.log(`First swiper-wrapper at position: ${firstSwiperPos}`);
  
  // Extract a chunk starting from the first swiper-wrapper (limit to avoid other carousels)
  // The main gallery is typically contained within a few thousand characters
  const startChunk = html.substring(firstSwiperPos, firstSwiperPos + 50000);
  
  // Find end of this swiper (next section or swiper-pagination/button)
  const endMarkers = ['swiper-pagination', 'swiper-button-next', 'class="c-navigation'];
  let endPos = startChunk.length;
  for (const marker of endMarkers) {
    const pos = startChunk.indexOf(marker);
    if (pos > 0 && pos < endPos) {
      endPos = pos;
    }
  }
  
  const galleryChunk = startChunk.substring(0, endPos);
  console.log(`Gallery chunk size: ${galleryChunk.length}`);

  // Find all carousel items in this chunk
  // Pattern: class="cmp-carousel__item swiper-slide c-carousel__item"
  const itemRegex = /<div[^>]*class="cmp-carousel__item\s+swiper-slide\s+c-carousel__item[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="cmp-carousel__item\s+swiper-slide|<div[^>]*class="[^"]*swiper-pagination|$)/gi;
  
  let match;
  let itemCount = 0;
  
  while ((match = itemRegex.exec(galleryChunk)) !== null) {
    itemCount++;
    const itemContent = match[1];
    console.log(`Processing carousel item ${itemCount}, content length: ${itemContent.length}`);
    
    // Extract img elements
    const imgMatches = itemContent.matchAll(/<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi);
    for (const imgMatch of imgMatches) {
      addImage(imgMatch[1], `carousel-${itemCount}`);
    }
    
    // Also try picture > source srcset
    const srcsetMatches = itemContent.matchAll(/<source[^>]*srcset="([^"]+)"[^>]*>/gi);
    for (const srcMatch of srcsetMatches) {
      const srcset = srcMatch[1];
      const parts = srcset.split(',').map(s => s.trim());
      const highRes = parts[parts.length - 1]?.split(' ')[0];
      if (highRes) {
        addImage(highRes, `carousel-${itemCount}-srcset`);
      }
    }
  }

  console.log(`Found ${itemCount} carousel items, ${images.length} valid images`);

  if (images.length > 0) {
    return images;
  }

  // Fallback: Look for images with "gallery" or "pdp" or "medium" or "large" in path
  console.log("Trying fallback: look for gallery/pdp images...");
  const galleryImgRegex = /<img[^>]*(?:src|data-src)="([^"]*(?:gallery|pdp|medium|large)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
  let galleryMatch;
  const firstPortion = html.substring(0, Math.floor(html.length / 4));
  
  while ((galleryMatch = galleryImgRegex.exec(firstPortion)) !== null) {
    addImage(galleryMatch[1], 'gallery-fallback');
  }

  console.log(`=== Total gallery images: ${images.length} ===`);
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
        waitFor: 12000,
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
