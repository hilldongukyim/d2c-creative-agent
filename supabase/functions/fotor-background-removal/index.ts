import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FOTOR_API_BASE = 'https://api-b.fotor.com';

async function pollTaskResult(taskId: string, apiKey: string, maxAttempts = 30): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Polling task ${taskId}, attempt ${i + 1}/${maxAttempts}`);
    
    const response = await fetch(`${FOTOR_API_BASE}/v1/aiart/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to poll task: ${response.status}`);
    }

    const result = await response.json();
    console.log('Poll result status:', result.data?.status);

    if (result.code !== '000') {
      throw new Error(`Task error: ${result.msg}`);
    }

    const status = result.data?.status;
    
    if (status === 1) {
      const resultUrl = result.data?.resultUrl;
      if (!resultUrl) {
        throw new Error('No result URL in completed task');
      }
      return resultUrl;
    } else if (status === 2) {
      throw new Error('Background removal task failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Task timeout - background removal took too long');
}

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

    console.log('Creating background removal task...');

    // Step 1: Create background removal task
    const createResponse = await fetch(`${FOTOR_API_BASE}/v1/aiart/backgroundremover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FOTOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userImageUrl: `data:image/png;base64,${imageBase64}`,
        action: 'auto',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Fotor API error:', errorText);
      throw new Error(`Fotor API error: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();

    if (createResult.code !== '000') {
      throw new Error(`Failed to create task: ${createResult.msg}`);
    }

    const taskId = createResult.data?.taskId;
    if (!taskId) {
      throw new Error('No taskId returned');
    }

    console.log('Task created:', taskId);

    // Step 2: Poll for result
    const resultUrl = await pollTaskResult(taskId, FOTOR_API_KEY);
    console.log('Result URL:', resultUrl);

    // Step 3: Download the result image and return as base64
    console.log('Downloading result image...');
    const imageResponse = await fetch(resultUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download result image');
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageUint8Array = new Uint8Array(imageArrayBuffer);
    const resultImageBase64 = base64Encode(imageUint8Array);
    
    console.log('Image downloaded and converted to base64, length:', resultImageBase64.length);

    return new Response(JSON.stringify({ 
      success: true,
      imageBase64: resultImageBase64
    }), {
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
