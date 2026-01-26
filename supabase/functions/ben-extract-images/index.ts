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
function extractFirstCarouselImage(html: string, baseUrl: string): string | null {
  console.log("Starting carousel image extraction with multiple strategies...");
  
  // Collect all potential gallery images with their strategies
  const candidates: Array<{ src: string; strategy: string; priority: number }> = [];
  
  // Helper to check if image is valid product image
  const isValidProductImage = (src: string): boolean => {
    const invalid = ['logo', 'icon', 'badge', 'star', 'rating', 'banner', 'award', '.svg', 'sprite'];
    const srcLower = src.toLowerCase();
    if (invalid.some(term => srcLower.includes(term))) return false;
    
    // Must be reasonable image format
    if (!srcLower.match(/\.(jpg|jpeg|png|webp)/)) return false;
    
    // Prefer images with gallery/product indicators
    const positive = ['gallery', 'product', 'large', 'zoom', 'detail'];
    const hasPositive = positive.some(term => srcLower.includes(term));
    
    return true;
  };
  
  // Strategy 1: Find image with data-swiper-slide-index="0" (Priority: 10)
  const slideZeroRegex = /data-swiper-slide-index="0"[^>]*>([\s\S]{1,8000}?)<img[^>]*src="([^"]+)"/ig;
  let match;
  while ((match = slideZeroRegex.exec(html)) !== null) {
    const src = match[2];
    if (isValidProductImage(src)) {
      candidates.push({ src, strategy: 'swiper-index-0', priority: 10 });
    }
  }
  
  // Strategy 2: Filename patterns like 01_, 001_, large01 (Priority: 9)
  const pattern01Regex = /<img[^>]*src="([^"]*(?:[\/\-_]0*1[_\-\.]|large0*1|gallery[\/\-]0*1|zoom[\/\-]0*1)[^"]*)"[^>]*>/ig;
  while ((match = pattern01Regex.exec(html)) !== null) {
    const src = match[1];
    if (isValidProductImage(src)) {
      // Higher priority for exact "01" vs "10" or "101"
      const isExact01 = src.match(/[\/\-_]0*1[_\-\.]/);
      candidates.push({ src, strategy: '01-pattern', priority: isExact01 ? 9 : 7 });
    }
  }
  
  // Strategy 3: First swiper-slide in swiper-wrapper (Priority: 8)
  const swiperWrapperIndex = html.search(/<div[^>]*(?:id|class)="[^"]*swiper-wrapper[^"]*"/i);
  if (swiperWrapperIndex !== -1) {
    const swiperSection = html.substring(swiperWrapperIndex, swiperWrapperIndex + 10000);
    const firstSlideRegex = /<div[^>]*class="[^"]*swiper-slide[^"]*"[^>]*>([\s\S]{1,5000}?)<img[^>]*src="([^"]+)"/i;
    match = firstSlideRegex.exec(swiperSection);
    if (match && isValidProductImage(match[2])) {
      candidates.push({ src: match[2], strategy: 'first-swiper-slide', priority: 8 });
    }
  }
  
  // Strategy 4: First cmp-carousel__item (Priority: 7)
  const carouselItemIndex = html.search(/<div[^>]*class="[^"]*cmp-carousel__item[^"]*"/i);
  if (carouselItemIndex !== -1) {
    const carouselSection = html.substring(carouselItemIndex, carouselItemIndex + 5000);
    const firstImgMatch = carouselSection.match(/<img[^>]*src="([^"]+)"/i);
    if (firstImgMatch && isValidProductImage(firstImgMatch[1])) {
      candidates.push({ src: firstImgMatch[1], strategy: 'first-carousel-item', priority: 7 });
    }
  }
  
  // Strategy 5: swiper-slide-active (Priority: 6)
  const activeSlideRegex = /<div[^>]*class="[^"]*swiper-slide-active[^"]*"[^>]*>([\s\S]{1,5000}?)<img[^>]*src="([^"]+)"/i;
  match = activeSlideRegex.exec(html);
  if (match && isValidProductImage(match[2])) {
    candidates.push({ src: match[2], strategy: 'swiper-slide-active', priority: 6 });
  }
  
  // Strategy 6: First /gallery/ image (Priority: 5)
  const galleryImgRegex = /<img[^>]*src="([^"]*\/gallery\/[^"]+)"[^>]*>/i;
  match = galleryImgRegex.exec(html);
  if (match && isValidProductImage(match[1])) {
    candidates.push({ src: match[1], strategy: 'gallery-path', priority: 5 });
  }
  
  // No candidates found
  if (candidates.length === 0) {
    console.log("✗ No valid carousel image found with any strategy");
    return null;
  }
  
  // Sort by priority (highest first), then by strategy reliability
  candidates.sort((a, b) => b.priority - a.priority);
  
  // Log all candidates
  console.log(`Found ${candidates.length} image candidates:`);
  candidates.slice(0, 5).forEach((c, i) => {
    console.log(`  ${i + 1}. [Priority ${c.priority}] ${c.strategy}: ${c.src.substring(0, 100)}...`);
  });
  
  // Return highest priority candidate
  const selected = candidates[0];
  console.log(`✓ Selected image (${selected.strategy}): ${selected.src}`);
  return selected.src;
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
    
    let imageUrl = extractFirstCarouselImage(html, url);
    
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
