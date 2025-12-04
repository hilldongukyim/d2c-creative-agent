import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Poll result:', JSON.stringify(result));

    if (result.code !== '000') {
      throw new Error(`Task error: ${result.msg}`);
    }

    const status = result.data?.status;
    
    if (status === 1) {
      // Task completed
      const resultUrl = result.data?.resultUrl;
      if (!resultUrl) {
        throw new Error('No result URL in completed task');
      }
      return resultUrl;
    } else if (status === 2) {
      // Task failed
      throw new Error('Background removal task failed');
    }
    
    // status === 0, still processing - wait and retry
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
    console.log('Image base64 length:', imageBase64.length);

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

    console.log('Create task response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Fotor API error:', errorText);
      throw new Error(`Fotor API error: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    console.log('Create task result:', JSON.stringify(createResult));

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

    return new Response(JSON.stringify({ 
      success: true,
      resultUrl 
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
