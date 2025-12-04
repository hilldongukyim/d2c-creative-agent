import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract carousel images from the MAIN PRODUCT gallery only
// Target: The first/primary swiper carousel on the page (product gallery)
function extractCarouselImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  console.log("Starting image extraction...");

  // Strategy 1: Find the FIRST swiper-wrapper with id pattern (main product gallery)
  // The main gallery usually has id like "swiper-wrapper-XXXX" and is the first one
  const firstSwiperMatch = html.match(/<div[^>]*id="swiper-wrapper-[a-f0-9]+"[^>]*class="[^"]*swiper-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*swiper-(?:button|pagination)/i);
  
  if (firstSwiperMatch) {
    const wrapperContent = firstSwiperMatch[1];
    console.log("Found first swiper-wrapper, extracting images...");
    
    // Extract all img src from this specific carousel
    const imgRegex = /<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(wrapperContent)) !== null) {
      const src = match[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
        // Filter out thumbnails and small images - we want gallery/high-res images
        if (!src.includes('thum-') && !src.includes('thumbnail') && !src.includes('180x180')) {
          seen.add(src);
          const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
          images.push(fullUrl);
          console.log("Found main gallery image:", fullUrl.substring(0, 100));
        }
      }
    }
  }

  // Strategy 2: Look for product gallery section specifically
  if (images.length === 0) {
    console.log("Trying product gallery section extraction...");
    
    // Look for common product gallery container patterns
    const galleryPatterns = [
      /<section[^>]*class="[^"]*(?:product-gallery|pdp-gallery|gallery-section)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /<div[^>]*class="[^"]*(?:product-gallery|pdp-gallery|gallery-main)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*(?:product-info|pdp-info)/gi,
    ];
    
    for (const pattern of galleryPatterns) {
      const sectionMatch = pattern.exec(html);
      if (sectionMatch) {
        const sectionContent = sectionMatch[1];
        const imgRegex = /<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
        let match;
        while ((match = imgRegex.exec(sectionContent)) !== null) {
          const src = match[1];
          if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
            if (!src.includes('thum-') && !src.includes('thumbnail') && !src.includes('180x180')) {
              seen.add(src);
              const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
              images.push(fullUrl);
              console.log("Found gallery image (section):", fullUrl.substring(0, 100));
            }
          }
        }
        if (images.length > 0) break;
      }
    }
  }

  // Strategy 3: Find carousel items with all three classes, but STOP after first carousel ends
  if (images.length === 0) {
    console.log("Trying carousel item extraction with boundary detection...");
    
    // First, find where the main product section ends (usually marked by product info/specs section)
    const productSectionEndPatterns = [
      /class="[^"]*(?:product-info|pdp-info|product-details|spec-section|related-products)/i,
      /<section[^>]*class="[^"]*(?:related|recommend|you-may-also)/i,
    ];
    
    let htmlToSearch = html;
    for (const pattern of productSectionEndPatterns) {
      const endMatch = html.match(pattern);
      if (endMatch && endMatch.index) {
        // Only search in the first part of the HTML (before related products)
        htmlToSearch = html.substring(0, endMatch.index);
        console.log("Limited search area to first", endMatch.index, "characters");
        break;
      }
    }
    
    // Now extract from the limited area
    const slideImgRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*swiper-slide[^"]*c-carousel__item[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:src|data-src)="([^"]+)"[^>]*>/gi;
    
    let match;
    while ((match = slideImgRegex.exec(htmlToSearch)) !== null) {
      const src = match[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
        if (!src.includes('thum-') && !src.includes('thumbnail') && !src.includes('180x180') && !src.includes('450x450')) {
          seen.add(src);
          const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
          images.push(fullUrl);
          console.log("Found carousel image:", fullUrl.substring(0, 100));
        }
      }
    }
  }

  // Strategy 4: Final fallback - look for high-res product images with specific patterns
  if (images.length === 0) {
    console.log("Final fallback: looking for high-res gallery images...");
    
    // Look for images with gallery in path or large dimensions in filename
    const highResRegex = /<img[^>]*(?:src|data-src)="([^"]*(?:gallery|large|zoom|hero|main)[^"]*\.(?:jpg|jpeg|png|webp))"[^>]*>/gi;
    
    let match;
    let count = 0;
    while ((match = highResRegex.exec(html)) !== null && count < 10) {
      const src = match[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !seen.has(src)) {
        if (!src.includes('thum-') && !src.includes('thumbnail') && !src.includes('180x180')) {
          seen.add(src);
          const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
          images.push(fullUrl);
          console.log("Found high-res image:", fullUrl.substring(0, 100));
          count++;
        }
      }
    }
  }

  console.log(`Total main gallery images found: ${images.length}`);
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

    console.log("Extracting MAIN gallery carousel images from URL:", url);

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
