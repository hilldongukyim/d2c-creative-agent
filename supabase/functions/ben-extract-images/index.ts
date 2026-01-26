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

// Extract first carousel image with multiple strategies
function extractFirstCarouselImage(html: string): string | null {
  const foundImages: string[] = [];
  
  // Strategy 1: Look for images in swiper-wrapper with specific gallery patterns
  // Target: #swiper-wrapper-* containing gallery images
  const swiperWrapperRegex = /<div[^>]*id="swiper-wrapper-[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  let swiperMatch;
  while ((swiperMatch = swiperWrapperRegex.exec(html)) !== null) {
    const wrapperContent = swiperMatch[1];
    // Look for high-res gallery images inside
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(wrapperContent)) !== null) {
      const src = imgMatch[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !src.includes('icon')) {
        // Prefer gallery images with recognizable patterns
        if (src.includes('/gallery/') || src.includes('large') || src.includes('2010x')) {
          console.log("Found gallery image in swiper-wrapper:", src);
          return src;
        }
        foundImages.push(src);
      }
    }
  }
  
  // Strategy 2: Look for cmp-carousel__item with gallery class
  const carouselGalleryRegex = /<div[^>]*class="[^"]*c-carousel__gallery[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*c-carousel__pagination/i;
  const galleryMatch = carouselGalleryRegex.exec(html);
  if (galleryMatch) {
    const galleryContent = galleryMatch[1];
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(galleryContent)) !== null) {
      const src = imgMatch[1];
      if (src && !src.includes('logo') && !src.endsWith('.svg') && !src.includes('icon')) {
        console.log("Found image in c-carousel__gallery:", src);
        return src;
      }
    }
  }
  
  // Strategy 3: Look for swiper-slide-active (current visible slide)
  const activeSlideRegex = /<div[^>]*class="[^"]*swiper-slide-active[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i;
  const activeMatch = activeSlideRegex.exec(html);
  if (activeMatch) {
    const slideContent = activeMatch[1];
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
    const imgMatch = imgRegex.exec(slideContent);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('logo') && !imgMatch[1].endsWith('.svg')) {
      console.log("Found active slide image:", imgMatch[1]);
      return imgMatch[1];
    }
  }
  
  // Strategy 4: Look for first cmp-carousel__item with img
  const carouselItemRegex = /<div[^>]*class="[^"]*cmp-carousel__item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i;
  const carouselMatch = carouselItemRegex.exec(html);
  if (carouselMatch) {
    const itemContent = carouselMatch[1];
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
    const imgMatch = imgRegex.exec(itemContent);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('logo') && !imgMatch[1].endsWith('.svg')) {
      console.log("Found carousel item image:", imgMatch[1]);
      return imgMatch[1];
    }
  }
  
  // Strategy 5: Look for data-src attribute (lazy-loaded images)
  const dataSrcRegex = /<img[^>]*class="[^"]*swiper[^"]*"[^>]*data-src="([^"]+)"[^>]*>/i;
  const dataSrcMatch = dataSrcRegex.exec(html);
  if (dataSrcMatch && dataSrcMatch[1] && !dataSrcMatch[1].includes('logo')) {
    console.log("Found lazy-loaded image:", dataSrcMatch[1]);
    return dataSrcMatch[1];
  }
  
  // Strategy 6: Look for images with gallery in the path
  const galleryImgRegex = /<img[^>]*src="([^"]*\/gallery\/[^"]+)"[^>]*>/i;
  const galleryImgMatch = galleryImgRegex.exec(html);
  if (galleryImgMatch && galleryImgMatch[1]) {
    console.log("Found gallery path image:", galleryImgMatch[1]);
    return galleryImgMatch[1];
  }
  
  // Strategy 7: Look for large product images (2010x1334, large01, etc.)
  const largeImgRegex = /<img[^>]*src="([^"]*(?:large\d+|2010x\d+|1334)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"[^>]*>/i;
  const largeImgMatch = largeImgRegex.exec(html);
  if (largeImgMatch && largeImgMatch[1]) {
    console.log("Found large image:", largeImgMatch[1]);
    return largeImgMatch[1];
  }
  
  // Return first found image if any
  if (foundImages.length > 0) {
    console.log("Returning first collected image:", foundImages[0]);
    return foundImages[0];
  }
  
  console.log("No carousel image found with any strategy");
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
        waitFor: 5000, // Increased wait time for dynamic content
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
