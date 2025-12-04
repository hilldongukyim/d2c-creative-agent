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
    if (!src) {
      console.log(`[${source}] Empty src`);
      return false;
    }
    
    // Normalize URL - remove /jcr:content/... suffix if present
    let cleanSrc = src;
    const jcrIndex = src.indexOf('/jcr:content');
    if (jcrIndex > 0) {
      cleanSrc = src.substring(0, jcrIndex);
    }
    
    if (seen.has(cleanSrc)) {
      return false;
    }
    
    // Only apply minimal filters
    if (cleanSrc.endsWith('.svg')) return false;
    if (cleanSrc.includes('logo')) return false;
    if (cleanSrc.includes('qrcode') || cleanSrc.includes('qr-code')) return false;
    
    seen.add(cleanSrc);
    const fullUrl = cleanSrc.startsWith('http') ? cleanSrc : new URL(cleanSrc, baseUrl).href;
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

  // Step 2: Split content by carousel items
  const items = swiperContent.split(/<div[^>]*class="cmp-carousel__item\s+swiper-slide\s+c-carousel__item[^"]*"[^>]*>/i);
  
  console.log(`Found ${items.length - 1} carousel items`);

  // Process each item
  for (let i = 1; i < items.length && i <= 20; i++) {
    const itemContent = items[i];
    
    // Find img with src attribute - simple direct extraction
    const imgSrcMatch = itemContent.match(/<img[^>]*\ssrc="([^"]+)"/i);
    if (imgSrcMatch) {
      console.log(`Item ${i} found src:`, imgSrcMatch[1].substring(0, 100));
      addImage(imgSrcMatch[1], `item-${i}`);
    } else {
      // Try data-src
      const dataSrcMatch = itemContent.match(/<img[^>]*\sdata-src="([^"]+)"/i);
      if (dataSrcMatch) {
        console.log(`Item ${i} found data-src:`, dataSrcMatch[1].substring(0, 100));
        addImage(dataSrcMatch[1], `item-${i}-data`);
      }
    }
  }

  // Remove duplicates that differ only by /jcr:content suffix
  const uniqueImages: string[] = [];
  const baseUrls = new Set<string>();
  
  for (const img of images) {
    const baseUrl = img.replace(/\/jcr:content.*$/, '');
    if (!baseUrls.has(baseUrl)) {
      baseUrls.add(baseUrl);
      uniqueImages.push(img);
    }
  }

  console.log(`=== Total unique gallery images: ${uniqueImages.length} ===`);
  return uniqueImages;
}

// Extract product name from HTML
function extractProductName(html: string, url: string): string {
  const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                       html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
  if (ogTitleMatch) {
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
      return new Response(JSON.stringify({ error: "Failed to scrape URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    if (!data.success) {
      return new Response(JSON.stringify({ error: "Scrape failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = data.data?.rawHtml || "";
    console.log("HTML length:", html.length);

    const images = extractCarouselImages(html, url);
    const productName = extractProductName(html, url);
    console.log("Total images extracted:", images.length);

    return new Response(JSON.stringify({
      success: true,
      images: images,
      productName: productName,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Extract failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
