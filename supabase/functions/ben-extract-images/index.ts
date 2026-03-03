import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidExternalUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') return { valid: false, error: "Only HTTPS URLs are allowed" };
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return { valid: false, error: "Localhost URLs are not allowed" };
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b] = ipv4Match.map(Number);
      if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || a === 127) {
        return { valid: false, error: "Private IP addresses are not allowed" };
      }
    }
    if (hostname === '169.254.169.254' || hostname.includes('metadata')) return { valid: false, error: "Metadata endpoints are not allowed" };
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

type SizeCategory = 'L' | 'M' | 'S';

const PRODUCT_SIZE_MAP: Record<string, SizeCategory> = {
  'refrigerator': 'L', 'fridge': 'L', 'washtower': 'L', 'wash-tower': 'L', 'soundbar': 'L',
  'tv': 'L', 'oled': 'L', 'qned': 'L', 'nanocell': 'L', 'monitor': 'L', 'styler': 'L',
  'washer': 'M', 'washing': 'M', 'dryer': 'M', 'vacuum': 'M', 'cordzero': 'M',
  'standbyme': 'M', 'stanbyme': 'M', 'projector': 'M', 'cinebeam': 'M', 'laptop': 'M',
  'gram': 'M', 'dishwasher': 'M', 'air-conditioner': 'M', 'airconditioner': 'M',
  'microwave': 'M', 'dehumidifier': 'M', 'air-purifier': 'M', 'puricare': 'M',
  'earbuds': 'S', 'tone-free': 'S', 'tonefree': 'S', 'headphones': 'S', 'speaker': 'S', 'xboom': 'S',
};

function detectProductCategory(url: string): SizeCategory {
  const lower = url.toLowerCase();
  
  // SoundSuite special cases: check before generic soundbar match
  if (lower.includes('soundsuite') || lower.includes('sound-suite') || lower.includes('sound_suite')) {
    if (lower.includes('m5') || lower.includes('m7')) return 'S';
    if (lower.includes('w7')) return 'M';
    // Other SoundSuite models fall through to generic map (→ L via 'soundbar')
  }
  
  for (const [keyword, size] of Object.entries(PRODUCT_SIZE_MAP)) {
    if (lower.includes(keyword)) return size;
  }
  return 'M';
}

function convertToHighQualityUrl(imageUrl: string, baseUrl: string): string {
  let url = imageUrl;
  if (url.startsWith('/')) {
    try {
      const base = new URL(baseUrl);
      url = `${base.protocol}//${base.hostname}${url}`;
    } catch { /* keep original */ }
  }
  if (url.includes('/jcr:content/renditions/')) {
    url = url.replace(/\/jcr:content\/renditions\/[^?]+/, '');
  }
  url = url.replace(/\?w=\d+/, '').replace(/&w=\d+/, '');
  return url;
}

function extractProductName(html: string): string {
  // Try <title> first
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1].trim();
    // Remove site suffix like " | LG ..."
    title = title.replace(/\s*\|.*$/, '').replace(/\s*-\s*LG.*$/i, '');
    if (title.length > 0 && title.length < 200) return title;
  }
  // Fallback to h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim().substring(0, 100);
  return 'Unknown Product';
}

function extractAllCarouselImages(html: string, baseUrl: string): Array<{ url: string; index: number }> {
  const isValidProductImage = (src: string): boolean => {
    const invalid = ['logo', 'icon', 'badge', 'star', 'rating', 'banner', 'award', '.svg', 'sprite'];
    const srcLower = src.toLowerCase();
    if (invalid.some(term => srcLower.includes(term))) return false;
    if (!srcLower.match(/\.(jpg|jpeg|png|webp)/)) return false;
    return true;
  };

  const seen = new Set<string>();
  const results: Array<{ url: string; index: number }> = [];

  const addImage = (src: string) => {
    const highQuality = convertToHighQualityUrl(src, baseUrl);
    if (!seen.has(highQuality) && isValidProductImage(highQuality)) {
      seen.add(highQuality);
      results.push({ url: highQuality, index: results.length });
    }
  };

  // Strategy 1: All swiper slides
  const swiperSlideRegex = /class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]{0,3000}?<img[^>]*src="([^"]+)"/gi;
  let match;
  while ((match = swiperSlideRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Strategy 2: cmp-carousel__item images
  const carouselItemRegex = /class="[^"]*cmp-carousel__item[^"]*"[^>]*>[\s\S]{0,3000}?<img[^>]*src="([^"]+)"/gi;
  while ((match = carouselItemRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Strategy 3: Gallery path images
  const galleryRegex = /<img[^>]*src="([^"]*\/gallery\/[^"]+)"[^>]*>/gi;
  while ((match = galleryRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  // Strategy 4: Filename 01 patterns (fallback if we have few results)
  if (results.length < 3) {
    const pattern01Regex = /<img[^>]*src="([^"]*(?:[\/\-_]0*1[_\-\.]|large0*1|gallery[\/\-]0*1)[^"]*)"[^>]*>/gi;
    while ((match = pattern01Regex.exec(html)) !== null) {
      addImage(match[1]);
    }
  }

  console.log(`Found ${results.length} unique gallery images`);
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const urlValidation = isValidExternalUrl(url);
    if (!urlValidation.valid) {
      return new Response(JSON.stringify({ error: urlValidation.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "Firecrawl API key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Extracting images from URL:", url);
    const sizeCategory = detectProductCategory(url);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["rawHtml"], waitFor: 5000 }),
    });

    if (!response.ok) {
      console.error("Firecrawl API error:", response.status);
      return new Response(JSON.stringify({ error: "Failed to scrape URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    if (!data.success) {
      return new Response(JSON.stringify({ error: "Scrape failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = data.data?.rawHtml || "";
    const images = extractAllCarouselImages(html, url);
    const productName = extractProductName(html);

    console.log(`Extracted ${images.length} images, product: ${productName}, size: ${sizeCategory}`);

    return new Response(JSON.stringify({
      success: true,
      images,
      sizeCategory,
      productName,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ben-extract-images:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Extract failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
