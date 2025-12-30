import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fixed Figma file configuration
const FIGMA_CONFIG = {
  fileKey: "bjwT2QqOSmjHejS5z2XzqE",
  fileName: "Promotion-Banners"
};

// In-memory cache with TTL (5 minutes)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  characters?: string;
  children?: FigmaNode[];
  fills?: any[];
}

interface ExtractedLayer {
  id: string;
  name: string;
  type: "TEXT" | "IMAGE" | "COMPONENT";
  currentValue: string | null;
  path: string;
}

function extractLayers(node: FigmaNode, path: string = ""): ExtractedLayer[] {
  const layers: ExtractedLayer[] = [];
  const currentPath = path ? `${path} > ${node.name}` : node.name;

  // Extract TEXT layers
  if (node.type === "TEXT" && node.characters) {
    layers.push({
      id: node.id,
      name: node.name,
      type: "TEXT",
      currentValue: node.characters,
      path: currentPath
    });
  }

  // Extract IMAGE layers (RECTANGLE with image fills)
  if ((node.type === "RECTANGLE" || node.type === "FRAME" || node.type === "INSTANCE") && node.fills) {
    const hasImageFill = node.fills.some((fill: any) => fill.type === "IMAGE");
    if (hasImageFill) {
      layers.push({
        id: node.id,
        name: node.name,
        type: "IMAGE",
        currentValue: null,
        path: currentPath
      });
    }
  }

  // Recursively process children
  if (node.children) {
    for (const child of node.children) {
      layers.push(...extractLayers(child, currentPath));
    }
  }

  return layers;
}

// Simple delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with exponential backoff for rate limiting
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 5): Promise<Response> {
  const baseDelay = 5000; // Start with 5 seconds
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Rate limited - use exponential backoff
      const retryAfterHeader = response.headers.get('Retry-After');
      let waitTime: number;
      
      if (retryAfterHeader) {
        // Use Retry-After header if available
        waitTime = parseInt(retryAfterHeader, 10) * 1000;
      } else {
        // Exponential backoff: 5s, 15s, 30s, 45s, 60s
        waitTime = Math.min(baseDelay * Math.pow(2, attempt), 60000);
      }
      
      console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}`);
      await delay(waitTime);
      continue;
    }
    
    return response;
  }
  
  throw new Error('RATE_LIMIT_EXCEEDED');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIGMA_ACCESS_TOKEN = Deno.env.get('FIGMA_ACCESS_TOKEN');
    
    if (!FIGMA_ACCESS_TOKEN) {
      throw new Error('FIGMA_ACCESS_TOKEN is not configured');
    }

    // Check cache first
    const cacheKey = `figma_${FIGMA_CONFIG.fileKey}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached Figma data');
      return new Response(JSON.stringify({
        success: true,
        ...cachedData,
        fromCache: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching Figma file: ${FIGMA_CONFIG.fileKey}`);

    // Fetch Figma file structure with retry
    const figmaResponse = await fetchWithRetry(
      `https://api.figma.com/v1/files/${FIGMA_CONFIG.fileKey}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    if (!figmaResponse.ok) {
      const errorText = await figmaResponse.text();
      console.error('Figma API error:', figmaResponse.status, errorText);
      
      if (figmaResponse.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Figma API 사용량이 많습니다. 1분 후에 다시 시도해주세요.',
          errorCode: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Figma API error: ${figmaResponse.status}`);
    }

    const figmaData = await figmaResponse.json();
    console.log(`File name: ${figmaData.name}`);

    // Extract layers from all pages
    const allLayers: ExtractedLayer[] = [];
    const pages: { name: string; id: string; layers: ExtractedLayer[] }[] = [];

    if (figmaData.document && figmaData.document.children) {
      for (const page of figmaData.document.children) {
        const pageLayers = extractLayers(page);
        pages.push({
          name: page.name,
          id: page.id,
          layers: pageLayers
        });
        allLayers.push(...pageLayers);
      }
    }

    // Filter to only include relevant layers (text and image)
    const textLayers = allLayers.filter(l => l.type === "TEXT");
    const imageLayers = allLayers.filter(l => l.type === "IMAGE");

    console.log(`Found ${textLayers.length} text layers, ${imageLayers.length} image layers`);

    // Prepare response data
    const responseData = {
      fileName: figmaData.name,
      fileKey: FIGMA_CONFIG.fileKey,
      lastModified: figmaData.lastModified,
      pages,
      summary: {
        totalTextLayers: textLayers.length,
        totalImageLayers: imageLayers.length
      },
      layers: allLayers
    };

    // Cache the data
    setCachedData(cacheKey, responseData);
    console.log('Figma data cached for 5 minutes');

    return new Response(JSON.stringify({
      success: true,
      ...responseData,
      fromCache: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yumi-figma-layers:', error);
    
    const isRateLimit = error.message === 'RATE_LIMIT_EXCEEDED' || error.message?.includes('Rate limit');
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: isRateLimit 
        ? 'Figma API 사용량이 많습니다. 1분 후에 다시 시도해주세요.'
        : error.message,
      errorCode: isRateLimit ? 'RATE_LIMIT' : 'UNKNOWN'
    }), {
      status: isRateLimit ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
