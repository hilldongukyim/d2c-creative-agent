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

// Check if image is the first/main gallery image
function isFirstGalleryImage(src: string): boolean {
  // Match patterns like: 01_, large01, gallery-01, -01., _01.
  // Also match gallery-zoom-01 or similar first image patterns
  const firstImagePatterns = [
    /[\/\-_]01[_\-\.]/i,        // 01_2010x1334, large01.jpg, gallery-01-
    /large01/i,                  // large01.jpg
    /gallery[\/\-]?01/i,         // gallery/01, gallery-01
    /zoom[\/\-]?01/i,            // zoom-01
    /\-01\./i,                   // image-01.jpg
  ];
  
  return firstImagePatterns.some(pattern => pattern.test(src));
}

// Extract product identifier from URL (e.g., "27gx704a-b" from the URL path)
function extractProductIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    // Get the last non-empty part of the path (usually the product slug)
    const productSlug = pathParts[pathParts.length - 1];
    console.log("Product slug from URL:", productSlug);
    return productSlug || null;
  } catch {
    return null;
  }
}

// Extract multiple product ID patterns for matching
function getProductIdPatterns(productSlug: string | null): string[] {
  if (!productSlug) return [];
  
  const patterns: string[] = [];
  
  // Add original slug
  patterns.push(productSlug);
  
  // Extract alphanumeric parts (remove hyphens)
  const alphanumeric = productSlug.replace(/-/g, '');
  if (alphanumeric !== productSlug) {
    patterns.push(alphanumeric);
  }
  
  // Extract core model number (e.g., "27gx704a" from "27gx704a-b")
  const coreModel = productSlug.split('-')[0];
  if (coreModel && coreModel !== productSlug) {
    patterns.push(coreModel);
  }
  
  // Extract just the letter-number combination (e.g., "gx704a")
  const modelCode = coreModel.match(/[a-z]+\d+[a-z]*/i);
  if (modelCode) {
    patterns.push(modelCode[0]);
  }
  
  console.log("Product ID patterns:", patterns);
  return patterns;
}

// Check if image URL matches any product pattern
function matchesProductId(imageSrc: string, patterns: string[]): boolean {
  const lowerSrc = imageSrc.toLowerCase();
  return patterns.some(pattern => lowerSrc.includes(pattern.toLowerCase()));
}

// Extract all gallery images and return the first one
function extractFirstCarouselImage(html: string, pageUrl: string): string | null {
  const productId = extractProductIdFromUrl(pageUrl);
  const productPatterns = getProductIdPatterns(productId);
  
  const allGalleryImages: string[] = [];
  const productMatchingImages: string[] = [];
  
  // Collect all gallery images from HTML
  const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    
    // Skip non-product images
    if (!src || 
        src.includes('logo') || 
        src.endsWith('.svg') || 
        src.includes('icon') ||
        src.includes('badge') ||
        src.includes('flag') ||
        src.includes('rating') ||
        src.includes('star')) {
      continue;
    }
    
    // Only collect gallery images
    // Collect images matching gallery patterns OR high-resolution product images
    const isGalleryImage = (
      src.includes('/gallery/') || 
      src.includes('large0') || 
      src.includes('2010x') ||
      src.includes('1334') ||
      src.includes('/images/') ||
      /\d{3,4}x\d{3,4}/i.test(src) || // Any image with resolution like 1600x1062
      /-\d{2,4}\.(?:jpg|jpeg|png|webp)/i.test(src) // Images ending with numbers like -01.jpg
    );
    
    if (isGalleryImage) {
      allGalleryImages.push(src);
      
      // Check if image path matches the product ID
      if (matchesProductId(src, productPatterns)) {
        productMatchingImages.push(src);
      }
    }
  }
  
  console.log(`Found ${allGalleryImages.length} total gallery images`);
  console.log(`Found ${productMatchingImages.length} product-matching gallery images`);
  
  // Prefer product-matching images
  const imagesToSearch = productMatchingImages.length > 0 ? productMatchingImages : allGalleryImages;
  
  if (imagesToSearch.length === 0) {
    console.log("No gallery images found");
    return null;
  }
  
  // First priority: Find explicit first image (01, large01, etc.)
  for (const src of imagesToSearch) {
    if (isFirstGalleryImage(src)) {
      console.log("Found first gallery image by pattern:", src);
      return src;
    }
  }
  
  // Second priority: Sort and get the first one numerically
  // Extract number from filename and sort
  const sortedImages = [...imagesToSearch].sort((a, b) => {
    // Extract numbers from the image paths
    const numA = a.match(/(\d+)[_\-\.](?:2010|1334|large|jpg|jpeg|png|webp)/i);
    const numB = b.match(/(\d+)[_\-\.](?:2010|1334|large|jpg|jpeg|png|webp)/i);
    
    const valA = numA ? parseInt(numA[1], 10) : 999;
    const valB = numB ? parseInt(numB[1], 10) : 999;
    
    return valA - valB;
  });
  
  console.log("Sorted gallery images, first is:", sortedImages[0]);
  return sortedImages[0];
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
