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

// Extract product dimensions from Spec section
function extractProductDimensions(html: string): { width?: string; height?: string; depth?: string; raw?: string } | null {
  console.log("=== Extracting product dimensions ===");
  
  const dimensions: { width?: string; height?: string; depth?: string; raw?: string } = {};
  
  // Try to find spec/dimension section patterns
  // Pattern 1: Look for dimension rows with W x H x D format
  const dimensionPatterns = [
    // W x H x D pattern (e.g., "1200 x 800 x 350 mm")
    /(?:dimension|size|spec)[^<]*?(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(mm|cm|inch)?/gi,
    // Individual dimension patterns
    /(?:width|가로)[^<]*?[:\s]+(\d+(?:\.\d+)?)\s*(mm|cm|inch)?/gi,
    /(?:height|높이|세로)[^<]*?[:\s]+(\d+(?:\.\d+)?)\s*(mm|cm|inch)?/gi,
    /(?:depth|깊이)[^<]*?[:\s]+(\d+(?:\.\d+)?)\s*(mm|cm|inch)?/gi,
  ];
  
  // Pattern for "Size (W x H x D)" format common in LG spec tables
  const sizeWHDMatch = html.match(/(?:size|dimension)[^<]*?\(?\s*W\s*[x×]\s*H\s*[x×]\s*D\s*\)?[^<]*?(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(mm|cm)?/i);
  if (sizeWHDMatch) {
    dimensions.width = sizeWHDMatch[1] + (sizeWHDMatch[4] || 'mm');
    dimensions.height = sizeWHDMatch[2] + (sizeWHDMatch[4] || 'mm');
    dimensions.depth = sizeWHDMatch[3] + (sizeWHDMatch[4] || 'mm');
    dimensions.raw = `${sizeWHDMatch[1]} x ${sizeWHDMatch[2]} x ${sizeWHDMatch[3]} ${sizeWHDMatch[4] || 'mm'}`;
    console.log("Found W x H x D dimensions:", dimensions);
    return dimensions;
  }

  // Pattern for table rows with dimension labels
  const widthMatch = html.match(/(?:<td[^>]*>|<th[^>]*>|<dt[^>]*>|<span[^>]*>)[^<]*(?:width|가로|W)[^<]*(?:<\/td>|<\/th>|<\/dt>|<\/span>)[^<]*(?:<td[^>]*>|<dd[^>]*>|<span[^>]*>)[^<]*?(\d+(?:\.\d+)?)\s*(mm|cm)?/i);
  const heightMatch = html.match(/(?:<td[^>]*>|<th[^>]*>|<dt[^>]*>|<span[^>]*>)[^<]*(?:height|높이|세로|H)[^<]*(?:<\/td>|<\/th>|<\/dt>|<\/span>)[^<]*(?:<td[^>]*>|<dd[^>]*>|<span[^>]*>)[^<]*?(\d+(?:\.\d+)?)\s*(mm|cm)?/i);
  const depthMatch = html.match(/(?:<td[^>]*>|<th[^>]*>|<dt[^>]*>|<span[^>]*>)[^<]*(?:depth|깊이|D)[^<]*(?:<\/td>|<\/th>|<\/dt>|<\/span>)[^<]*(?:<td[^>]*>|<dd[^>]*>|<span[^>]*>)[^<]*?(\d+(?:\.\d+)?)\s*(mm|cm)?/i);

  if (widthMatch) {
    dimensions.width = widthMatch[1] + (widthMatch[2] || 'mm');
  }
  if (heightMatch) {
    dimensions.height = heightMatch[1] + (heightMatch[2] || 'mm');
  }
  if (depthMatch) {
    dimensions.depth = depthMatch[1] + (depthMatch[2] || 'mm');
  }

  // Also try to find raw dimension string for complex formats
  const rawDimensionMatch = html.match(/(?:dimension|size|spec)[^<]*?[:\s]*(\d+(?:\.\d+)?(?:\s*[x×]\s*\d+(?:\.\d+)?){1,2})\s*(mm|cm|inch)?/i);
  if (rawDimensionMatch) {
    dimensions.raw = rawDimensionMatch[1] + ' ' + (rawDimensionMatch[2] || 'mm');
  }

  if (Object.keys(dimensions).length > 0) {
    console.log("Found dimensions:", dimensions);
    return dimensions;
  }

  console.log("No dimensions found in spec section");
  return null;
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
    const productDimensions = extractProductDimensions(html);
    console.log("Total images extracted:", images.length);
    console.log("Product dimensions:", productDimensions);

    return new Response(JSON.stringify({
      success: true,
      images: images,
      productName: productName,
      productDimensions: productDimensions,
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
