import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract carousel images from the MAIN PRODUCT gallery
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("Starting image extraction...");

  // Helper to add image if valid
  const addImage = (src: string, source: string) => {
    if (!src || seen.has(src)) return false;
    if (src.includes('logo') || src.endsWith('.svg')) return false;
    if (src.includes('thum-') || src.includes('thumbnail')) return false;
    if (src.includes('180x180') || src.includes('100x100')) return false;
    if (src.includes('placeholder') || src.includes('loading')) return false;
    
    seen.add(src);
    const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
    images.push(fullUrl);
    console.log(`Found image (${source}):`, fullUrl.substring(0, 120));
    return true;
  };

  // Strategy 1: Look for LG's specific gallery structure
  // LG uses picture elements with source srcset for responsive images
  // Pattern: <picture><source srcset="..."><img src="..."></picture>
  const pictureRegex = /<picture[^>]*>[\s\S]*?<source[^>]*srcset="([^"]+)"[\s\S]*?<\/picture>/gi;
  let pictureMatch;
  let pictureCount = 0;
  
  // Only look in the first third of the HTML (where product gallery typically is)
  const firstThird = html.substring(0, Math.floor(html.length / 3));
  
  while ((pictureMatch = pictureRegex.exec(firstThird)) !== null && pictureCount < 15) {
    const srcset = pictureMatch[1];
    // Get the highest resolution image from srcset
    const srcsetParts = srcset.split(',').map(s => s.trim());
    const lastSrc = srcsetParts[srcsetParts.length - 1]?.split(' ')[0];
    if (lastSrc && addImage(lastSrc, 'picture-srcset')) {
      pictureCount++;
    }
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from picture elements`);
    return images;
  }

  // Strategy 2: Look for swiper/carousel with data-src or src attributes
  // Common pattern for LG product galleries
  const swiperSlideRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:data-src|src)="([^"]+)"[^>]*>/gi;
  let slideMatch;
  
  while ((slideMatch = swiperSlideRegex.exec(firstThird)) !== null) {
    addImage(slideMatch[1], 'swiper-slide');
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from swiper slides`);
    return images;
  }

  // Strategy 3: Look for gallery/zoom images (high-res product photos)
  const galleryImgRegex = /<img[^>]*(?:data-src|src)="([^"]*(?:gallery|zoom|large|hero|pdp|product)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
  let galleryMatch;
  
  while ((galleryMatch = galleryImgRegex.exec(firstThird)) !== null) {
    addImage(galleryMatch[1], 'gallery-pattern');
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from gallery pattern`);
    return images;
  }

  // Strategy 4: Look for images with specific LG DAM patterns
  // LG uses /content/dam/channel/wcms/ for product images
  const lgDamRegex = /<img[^>]*(?:data-src|src)="([^"]*\/content\/dam\/channel\/wcms\/[^"]*(?:gallery|pdp|product|medium|large)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
  let lgMatch;
  
  while ((lgMatch = lgDamRegex.exec(html)) !== null) {
    // Skip promotional/USP images
    if (!lgMatch[1].includes('usp') && !lgMatch[1].includes('USP') && !lgMatch[1].includes('feature')) {
      addImage(lgMatch[1], 'lg-dam');
    }
  }

  if (images.length > 0) {
    console.log(`Found ${images.length} images from LG DAM pattern`);
    return images;
  }

  // Strategy 5: Broader search for product images in first portion of page
  const broadRegex = /<img[^>]*(?:data-src|src)="([^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"[^>]*>/gi;
  let broadMatch;
  let count = 0;
  
  while ((broadMatch = broadRegex.exec(firstThird)) !== null && count < 20) {
    const src = broadMatch[1];
    // Filter out small thumbnails, icons, and promotional content
    if (!src.includes('icon') && 
        !src.includes('flag') && 
        !src.includes('badge') &&
        !src.includes('btn') &&
        !src.includes('button') &&
        !src.includes('arrow') &&
        !src.includes('social') &&
        !src.includes('350x350') && // Skip small promotional images
        !src.includes('usp') &&
        !src.includes('USP')) {
      if (addImage(src, 'broad-search')) {
        count++;
      }
    }
  }

  console.log(`Total main gallery images found: ${images.length}`);
  return images;
}

// Extract product name from HTML
function extractProductName(html: string, url: string): string {
  // Try og:title first (most reliable for product name)
  const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                       html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
  if (ogTitleMatch) {
    console.log("Found og:title:", ogTitleMatch[1]);
    return cleanProductName(ogTitleMatch[1]);
  }

  // Try title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    console.log("Found title:", titleMatch[1]);
    return cleanProductName(titleMatch[1]);
  }

  // Try h1 tag
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    console.log("Found h1:", h1Match[1]);
    return cleanProductName(h1Match[1]);
  }

  // Fallback: extract from URL
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

    console.log("Extracting MAIN gallery images from URL:", url);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["rawHtml"],
        waitFor: 8000, // Increased wait time for dynamic content
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
