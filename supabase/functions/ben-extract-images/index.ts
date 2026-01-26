import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SSRF protection: Validate URLs to prevent internal network access
function isValidExternalUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    
    // Only allow https protocol
    if (url.protocol !== 'https:') {
      return { valid: false, error: "Only HTTPS URLs are allowed" };
    }
    
    const hostname = url.hostname.toLowerCase();
    
    // Block localhost and loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { valid: false, error: "Localhost URLs are not allowed" };
    }
    
    // Block private IP ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b, c] = ipv4Match.map(Number);
      if (
        a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 169 && b === 254) ||
        a === 127
      ) {
        return { valid: false, error: "Private IP addresses are not allowed" };
      }
    }
    
    // Block AWS/cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname.includes('metadata')) {
      return { valid: false, error: "Metadata endpoints are not allowed" };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

// Product size category mapping based on product type
type SizeCategory = 'L' | 'M' | 'S';

const PRODUCT_SIZE_MAP: Record<string, SizeCategory> = {
  // Large (대)
  'refrigerator': 'L',
  'fridge': 'L',
  'washtower': 'L',
  'wash-tower': 'L',
  'soundbar': 'L',
  'tv': 'L',
  'oled': 'L',
  'qned': 'L',
  'nanocell': 'L',
  'monitor': 'L',
  'styler': 'L',
  
  // Medium (중)
  'washer': 'M',
  'washing': 'M',
  'dryer': 'M',
  'vacuum': 'M',
  'cordzero': 'M',
  'standbyme': 'M',
  'stanbyme': 'M',
  'projector': 'M',
  'cinebeam': 'M',
  'laptop': 'M',
  'gram': 'M',
  'dishwasher': 'M',
  'air-conditioner': 'M',
  'airconditioner': 'M',
  'microwave': 'M',
  'dehumidifier': 'M',
  'air-purifier': 'M',
  'puricare': 'M',
  
  // Small (소)
  'earbuds': 'S',
  'tone-free': 'S',
  'tonefree': 'S',
  'headphones': 'S',
  'speaker': 'S',
  'xboom': 'S',
};

function detectProductCategory(url: string): SizeCategory {
  const lowerUrl = url.toLowerCase();
  for (const [keyword, size] of Object.entries(PRODUCT_SIZE_MAP)) {
    if (lowerUrl.includes(keyword)) {
      console.log(`Detected product keyword: ${keyword} -> Size: ${size}`);
      return size;
    }
  }
  console.log("No product keyword matched, defaulting to Medium");
  return 'M'; // Default to medium if no match
}

// Convert thumbnail URL to high-quality original URL
function convertToHighQualityUrl(imageUrl: string, baseUrl: string): string {
  let url = imageUrl;
  
  // Handle relative URLs
  if (url.startsWith('/')) {
    try {
      const base = new URL(baseUrl);
      url = `${base.protocol}//${base.hostname}${url}`;
    } catch {
      // Keep original if parsing fails
    }
  }
  
  // Remove thumbnail renditions path and query params to get original high-res image
  // Pattern: /jcr:content/renditions/thum-1600x1062.jpeg?w=800 -> remove it
  if (url.includes('/jcr:content/renditions/')) {
    url = url.replace(/\/jcr:content\/renditions\/[^?]+/, '');
  }
  
  // Remove size query parameters
  url = url.replace(/\?w=\d+/, '');
  url = url.replace(/&w=\d+/, '');
  
  console.log("Converted to high-quality URL:", url);
  return url;
}

// Extract the first carousel/gallery image from HTML
function extractFirstCarouselImage(html: string): string | null {
  console.log("Starting carousel image extraction with multiple strategies...");
  
  // Strategy 1: Find first image with data-swiper-slide-index="0" (MOST RELIABLE)
  const slideZeroRegex = /data-swiper-slide-index="0"[^>]*>([\s\S]{1,5000}?)<img[^>]*src="([^"]+)"/i;
  const slideZeroMatch = slideZeroRegex.exec(html);
  if (slideZeroMatch && slideZeroMatch[2]) {
    const src = slideZeroMatch[2];
    if (!src.includes('logo') && !src.endsWith('.svg')) {
      console.log("✓ Found image with data-swiper-slide-index='0':", src);
      return src;
    }
  }
  
  // Strategy 2: Look for images with '01' or '001' pattern in filename (first image convention)
  const pattern01Regex = /<img[^>]*src="([^"]*(?:\/01[_\-\.]|\/001[_\-\.]|large01|gallery[\/\-]01|newgallery\/01_)[^"]*)"[^>]*>/i;
  const pattern01Match = pattern01Regex.exec(html);
  if (pattern01Match && pattern01Match[1]) {
    const src = pattern01Match[1];
    if (!src.includes('logo') && !src.endsWith('.svg')) {
      console.log("✓ Found '01' pattern image:", src);
      return src;
    }
  }
  
  // Strategy 3: Find swiper-slide with specific first-slide class
  const firstSlideRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*data-swiper-slide-index="0"[^>]*>([\s\S]{1,3000}?)<img[^>]*src="([^"]+)"/i;
  const firstSlideMatch = firstSlideRegex.exec(html);
  if (firstSlideMatch && firstSlideMatch[2]) {
    const src = firstSlideMatch[2];
    if (!src.includes('logo') && !src.endsWith('.svg')) {
      console.log("✓ Found first swiper-slide (index=0) image:", src);
      return src;
    }
  }
  
  // Strategy 4: Find FIRST cmp-carousel__item (not just any)
  const carouselItemIndex = html.search(/<div[^>]*class="[^"]*cmp-carousel__item[^"]*"/i);
  if (carouselItemIndex !== -1) {
    const carouselSection = html.substring(carouselItemIndex, carouselItemIndex + 5000);
    const firstImgMatch = carouselSection.match(/<img[^>]*src="([^"]+)"/i);
    if (firstImgMatch && firstImgMatch[1]) {
      const src = firstImgMatch[1];
      if (!src.includes('logo') && !src.endsWith('.svg')) {
        console.log("✓ Found first cmp-carousel__item image:", src);
        return src;
      }
    }
  }
  
  // Strategy 5: Find swiper-slide-active (current visible slide)
  const activeSlideRegex = /<div[^>]*class="[^"]*swiper-slide-active[^"]*"[^>]*>([\s\S]{1,3000}?)<img[^>]*src="([^"]+)"/i;
  const activeMatch = activeSlideRegex.exec(html);
  if (activeMatch && activeMatch[2]) {
    const src = activeMatch[2];
    if (!src.includes('logo') && !src.endsWith('.svg')) {
      console.log("✓ Found swiper-slide-active image:", src);
      return src;
    }
  }
  
  // Strategy 6: Find first /gallery/ image
  const galleryImgIndex = html.search(/<img[^>]*src="[^"]*\/gallery\//i);
  if (galleryImgIndex !== -1) {
    const gallerySection = html.substring(galleryImgIndex, galleryImgIndex + 500);
    const imgMatch = gallerySection.match(/<img[^>]*src="([^"]+)"/i);
    if (imgMatch && imgMatch[1]) {
      const src = imgMatch[1];
      if (!src.includes('logo') && !src.endsWith('.svg')) {
        console.log("✓ Found first /gallery/ image:", src);
        return src;
      }
    }
  }
  
  console.log("✗ No carousel image found with any strategy");
  return null;
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

    // Validate URL for SSRF protection
    const urlValidation = isValidExternalUrl(url);
    if (!urlValidation.valid) {
      console.error("URL validation failed:", urlValidation.error);
      return new Response(JSON.stringify({ error: urlValidation.error }), {
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

    console.log("Extracting images from URL:", url);
    
    // Detect product size category from URL
    const sizeCategory = detectProductCategory(url);
    console.log("Product size category:", sizeCategory);

    // Get rawHtml to parse for images
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
    
    let imageUrl = extractFirstCarouselImage(html);
    
    // Convert to high-quality URL if found
    if (imageUrl) {
      imageUrl = convertToHighQualityUrl(imageUrl, url);
    }
    
    console.log("Final image URL:", imageUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl: imageUrl,
      sizeCategory: sizeCategory,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ben-extract-images:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Extract failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
