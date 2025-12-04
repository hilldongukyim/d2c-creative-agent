import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract product gallery images from the TOP carousel
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("=== Extracting TOP gallery images ===");

  const addImage = (src: string, source: string) => {
    if (!src || seen.has(src)) return false;
    
    // Skip small/thumbnail images
    if (src.includes('thum') || src.includes('thumbnail')) return false;
    if (src.includes('180x180') || src.includes('100x100')) return false;
    if (src.includes('placeholder') || src.includes('loading')) return false;
    
    // Skip non-product images
    if (src.includes('logo') || src.endsWith('.svg')) return false;
    if (src.includes('qrcode') || src.includes('qr-code')) return false;
    if (src.includes('icon') || src.includes('badge') || src.includes('flag')) return false;
    
    // Skip feature/promotional images
    if (src.includes('/features/')) return false;
    if (src.includes('/usp/')) return false;
    
    seen.add(src);
    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
    images.push(fullUrl);
    console.log(`✓ Image [${images.length}]:`, fullUrl);
    return true;
  };

  // Step 1: Find the FIRST swiper-wrapper
  const swiperMatch = html.match(/(<div[^>]*id="swiper-wrapper-[^"]*"[^>]*>)([\s\S]*?)(<div[^>]*class="[^"]*swiper-button|<div[^>]*class="[^"]*swiper-pagination)/i);
  
  if (!swiperMatch) {
    console.log("No swiper-wrapper found");
    return images;
  }

  const swiperContent = swiperMatch[2];
  console.log(`Swiper content length: ${swiperContent.length}`);
  
  // DEBUG: Log first 500 chars of swiper content
  console.log("Swiper content preview:", swiperContent.substring(0, 500));

  // Step 2: Split content by carousel items
  const items = swiperContent.split(/<div[^>]*class="cmp-carousel__item\s+swiper-slide\s+c-carousel__item[^"]*"[^>]*>/i);
  
  console.log(`Found ${items.length - 1} carousel items`);

  // Process each item
  for (let i = 1; i < items.length && i <= 20; i++) {
    const itemContent = items[i];
    console.log(`Item ${i}: ${itemContent.length} chars`);
    
    // DEBUG: Log first 300 chars of first 3 items to see structure
    if (i <= 3) {
      console.log(`Item ${i} preview:`, itemContent.substring(0, 300));
    }
    
    // Method 1: Find ALL img tags regardless of attribute
    const allImgRegex = /<img([^>]*)>/gi;
    let imgTagMatch;
    
    while ((imgTagMatch = allImgRegex.exec(itemContent)) !== null) {
      const imgAttrs = imgTagMatch[1];
      console.log(`Item ${i} img attrs:`, imgAttrs.substring(0, 200));
      
      // Try to extract src from various attributes
      const srcMatch = imgAttrs.match(/(?:src|data-src|data-lazy-src|data-original)="([^"]+)"/i);
      if (srcMatch) {
        addImage(srcMatch[1], `item-${i}-img`);
      }
      
      // Also check srcset
      const srcsetMatch = imgAttrs.match(/srcset="([^"]+)"/i);
      if (srcsetMatch) {
        const parts = srcsetMatch[1].split(',').map(s => s.trim());
        const lastUrl = parts[parts.length - 1]?.split(' ')[0];
        if (lastUrl) {
          addImage(lastUrl, `item-${i}-srcset`);
        }
      }
    }
    
    // Method 2: Look for picture > source with srcset
    const sourceRegex = /<source[^>]*srcset="([^"]+)"[^>]*>/gi;
    let sourceMatch;
    
    while ((sourceMatch = sourceRegex.exec(itemContent)) !== null) {
      const srcset = sourceMatch[1];
      const parts = srcset.split(',').map(s => s.trim());
      const lastUrl = parts[parts.length - 1]?.split(' ')[0];
      if (lastUrl) {
        console.log(`Item ${i} source srcset:`, lastUrl.substring(0, 100));
        addImage(lastUrl, `item-${i}-source`);
      }
    }
    
    // Method 3: Look for any URL that looks like an image
    const urlRegex = /["'](https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
    let urlMatch;
    
    while ((urlMatch = urlRegex.exec(itemContent)) !== null) {
      addImage(urlMatch[1], `item-${i}-url`);
    }
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
        waitFor: 15000,
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
