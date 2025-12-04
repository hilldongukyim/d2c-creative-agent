import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const FOTOR_API_KEY = Deno.env.get('FOTOR_API_KEY');
    if (!FOTOR_API_KEY) {
      throw new Error('FOTOR_API_KEY not configured');
    }

    console.log('Calling Fotor Background Remover API...');

    const response = await fetch('https://api-b.fotor.com/v1/aiart/backgroundremover', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FOTOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });

    console.log('Fotor response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fotor API error:', errorText);
      throw new Error(`Fotor API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Fotor API success');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
