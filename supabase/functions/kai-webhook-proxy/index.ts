import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, imageUrl, fileName } = await req.json();

    console.log("=== Kai Webhook Proxy - Background Removal ===");
    console.log("Email:", email);
    console.log("Image URL:", imageUrl);
    console.log("File Name:", fileName);

    const REMOVE_BG_API_KEY = Deno.env.get('REMOVE_BG_API_KEY');
    if (!REMOVE_BG_API_KEY) {
      throw new Error('REMOVE_BG_API_KEY not configured');
    }

    // If imageUrl provided, use URL-based removal
    const formData = new FormData();
    if (imageUrl) {
      formData.append('image_url', imageUrl);
    }
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remove.bg API error: ${response.status} - ${errorText}`);
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = base64Encode(new Uint8Array(resultBuffer));

    return new Response(JSON.stringify({
      success: true,
      imageBase64: resultBase64,
      status: response.status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in kai-webhook-proxy:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});