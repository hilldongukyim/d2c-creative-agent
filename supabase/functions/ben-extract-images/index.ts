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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractModelTokens(url: string, html: string): string[] {
  const tokens = new Set<string>();
  const stopwords = new Set([
    'lg', 'com', 'www', 'shop', 'products', 'product', 'appliances', 'appliance', 'electronics',
    'washing', 'machine', 'laundry', 'tv', 'oled', 'soundbar', 'monitor', 'home', 'kitchen',
    'gallery', 'images', 'image', 'drain', 'hose', 'and', 'the'
  ]);

  // URL path 기반 모델 토큰
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const segments = pathname.split('/').filter(Boolean).map((s) => s.replace(/\.html?$/, ''));

    for (const seg of segments) {
      if (seg.length >= 5 && /\d/.test(seg) && !stopwords.has(seg)) {
        tokens.add(seg);
      }
      for (const part of seg.split('-')) {
        if (part.length >= 5 && /\d/.test(part) && !stopwords.has(part)) {
          tokens.add(part);
        }
      }
    }
  } catch {
    // ignore
  }

  // title/h1 기반 모델 토큰
  const productName = extractProductName(html).toLowerCase();
  const modelCandidates = productName.match(/\b[a-z0-9-]{5,}\b/gi) || [];
  for (const candidate of modelCandidates) {
    const cleaned = candidate.replace(/[^a-z0-9-]/g, '');
    if (cleaned.length >= 5 && /\d/.test(cleaned) && !stopwords.has(cleaned)) {
      tokens.add(cleaned);
    }
  }

  return Array.from(tokens);
}

function extractAllCarouselImages(html: string, baseUrl: string): Array<{ url: string; index: number; priority: number }> {
  const modelTokens = extractModelTokens(baseUrl, html);
  console.log(`Detected model tokens: ${modelTokens.join(', ') || 'none'}`);

  const isValidProductImage = (src: string): boolean => {
    const invalid = ['logo', 'icon', 'badge', 'star', 'rating', 'banner', 'award', '.svg', 'sprite',
      'lifestyle', 'campaign', 'promo', 'hero', 'kv', 'key-visual', 'ambient', 'scene',
      'background', 'bg-', 'environment', 'room', 'interior', 'feature', 'usp',
      'infographic', 'info-', 'dimension', 'spec', 'energy-label', 'energy_label',
      'accessory', 'accessories', 'installation', 'how-to', 'howto',
      'related', 'recommend', 'cross-sell', 'also-like', 'recently-viewed', 'you-may-like', 'similar'];
    const srcLower = src.toLowerCase();
    if (invalid.some(term => srcLower.includes(term))) return false;
    if (!srcLower.match(/\.(jpg|jpeg|png|webp)/)) return false;
    return true;
  };

  const hasModelMatch = (src: string): boolean => {
    if (modelTokens.length === 0) return false;
    const lower = src.toLowerCase();
    return modelTokens.some((token) => lower.includes(token));
  };

  const scoreFrontProduct = (src: string): number => {
    const lower = src.toLowerCase();
    let score = 0;

    if (hasModelMatch(lower)) score += 70;
    else if (modelTokens.length > 0) score -= 35;

    if (/[\/\-_](front|f)[\/\-_.\d]/i.test(lower)) score += 30;
    if (/[\/\-_]01[\/\-_.\s]|[\/\-_]01\.(jpg|png|webp)/i.test(lower)) score += 25;
    if (/large01|large_01|large-01/i.test(lower)) score += 25;
    if (/[\/\-_]0*1[_\-\.]/i.test(lower)) score += 20;

    if (lower.includes('/gallery/')) score += 15;
    if (lower.includes('/images/') && !lower.includes('/feature')) score += 10;

    if (/angle|side|back|top|bottom|tilt|close/i.test(lower)) score -= 10;
    if (/[\/\-_](d|l|m)\d+[\/\-_]/i.test(lower) && !/[\/\-_](d|l|m)01/i.test(lower)) score -= 5;

    return score;
  };

  const seen = new Set<string>();
  const rawResults: Array<{ url: string; index: number; priority: number; modelMatched: boolean }> = [];

  const addImage = (src: string) => {
    const highQuality = convertToHighQualityUrl(src, baseUrl);
    if (!seen.has(highQuality) && isValidProductImage(highQuality)) {
      seen.add(highQuality);
      rawResults.push({
        url: highQuality,
        index: rawResults.length,
        priority: scoreFrontProduct(highQuality),
        modelMatched: hasModelMatch(highQuality),
      });
    }
  };

  // 메인 갤러리 근처만 스코핑
  const lowerHtml = html.toLowerCase();
  const galleryAnchors = ['pdp-gallery', 'product-gallery', 'visual-header', 'cmp-carousel', 'swiper-wrapper', 'gallery'];
  let anchorPos = -1;
  for (const anchor of galleryAnchors) {
    const pos = lowerHtml.indexOf(anchor);
    if (pos !== -1 && (anchorPos === -1 || pos < anchorPos)) anchorPos = pos;
  }

  let scopedHtml = html;
  if (anchorPos !== -1) {
    const start = Math.max(0, anchorPos - 20000);
    const end = Math.min(html.length, anchorPos + 220000);
    scopedHtml = html.slice(start, end);
    console.log(`Using anchor-scoped HTML (${scopedHtml.length} chars)`);
  } else {
    const cutoff = Math.min(html.length, Math.floor(html.length * 0.2));
    scopedHtml = html.substring(0, cutoff);
    console.log(`Using top 20% fallback HTML (${scopedHtml.length} chars)`);
  }

  const swiperSlideRegex = /class="[^"]*swiper-slide[^"]*"[^>]*>[\s\S]{0,3000}?<img[^>]*src="([^"]+)"/gi;
  let match;
  while ((match = swiperSlideRegex.exec(scopedHtml)) !== null) {
    addImage(match[1]);
  }

  const carouselItemRegex = /class="[^"]*cmp-carousel__item[^"]*"[^>]*>[\s\S]{0,3000}?<img[^>]*src="([^"]+)"/gi;
  while ((match = carouselItemRegex.exec(scopedHtml)) !== null) {
    addImage(match[1]);
  }

  const galleryRegex = /<img[^>]*src="([^"]*\/gallery\/[^"]+)"[^>]*>/gi;
  while ((match = galleryRegex.exec(html)) !== null) {
    addImage(match[1]);
  }

  if (rawResults.length < 3) {
    const pattern01Regex = /<img[^>]*src="([^"]*(?:[\/\-_]0*1[_\-\.]|large0*1|gallery[\/\-]0*1)[^"]*)"[^>]*>/gi;
    while ((match = pattern01Regex.exec(scopedHtml)) !== null) {
      addImage(match[1]);
    }
  }

  // 모델 토큰이 있으면, 모델 매칭된 이미지만 사용 (타 제품 섞임 방지)
  let filtered = rawResults;
  let modelMatched = rawResults.filter((r) => r.modelMatched);

  if (modelTokens.length > 0) {
    if (modelMatched.length === 0) {
      // Rescue pass: raw HTML에서 모델 토큰이 들어간 이미지 URL 직접 탐색
      for (const token of modelTokens) {
        const tokenRegex = new RegExp(`(?:https?:)?\\/\\/[^"'\\s<>]*${escapeRegExp(token)}[^"'\\s<>]*\\.(?:jpg|jpeg|png|webp)`, 'gi');
        let tokenMatch;
        while ((tokenMatch = tokenRegex.exec(html)) !== null) {
          addImage(tokenMatch[0].replace(/\\u002F/g, '/'));
        }
      }
      modelMatched = rawResults.filter((r) => r.modelMatched);
    }

    if (modelMatched.length > 0) {
      filtered = modelMatched;
      console.log(`Model-matched filter applied: ${filtered.length}/${rawResults.length}`);
    } else {
      console.log(`No model-matched image found. Discarding non-matching candidates to avoid wrong product output.`);
      filtered = [];
    }
  }

  filtered.sort((a, b) => b.priority - a.priority);
  filtered.forEach((r, i) => { r.index = i; });

  const results = filtered.map(({ url, index, priority }) => ({ url, index, priority }));

  console.log(`Found ${results.length} unique gallery images (sorted by strict relevance)`);
  if (results.length > 0) {
    console.log(`Top image: ${results[0].url} (score: ${results[0].priority})`);
  }
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
