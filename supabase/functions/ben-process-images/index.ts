import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOTOR_API_BASE = 'https://api-b.fotor.com';

async function removeBackgroundWithFotor(imageUrl: string, apiKey: string): Promise<string> {
  console.log("Creating Fotor task for image:", imageUrl);

  // Step 1: Create the background removal task
  const createResponse = await fetch(`${FOTOR_API_BASE}/v1/aiart/backgroundremover`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Fotor create task error:", createResponse.status, errorText);
    throw new Error(`Failed to create Fotor task: ${createResponse.status}`);
  }

  const createData = await createResponse.json();
  console.log("Fotor task created:", createData);

  if (createData.code !== '000') {
    throw new Error(`Failed to create task: ${createData.msg}`);
  }

  const taskId = createData.data?.taskId;
  if (!taskId) {
    throw new Error("No taskId returned from Fotor");
  }

  // Step 2: Poll for task completion using correct endpoint
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Polling task ${taskId}, attempt ${attempts + 1}/${maxAttempts}`);
    
    // Use the correct polling endpoint: /v1/aiart/tasks/{taskId}
    const statusResponse = await fetch(`${FOTOR_API_BASE}/v1/aiart/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!statusResponse.ok) {
      console.error("Fotor status check error:", statusResponse.status);
      attempts++;
      continue;
    }

    const statusData = await statusResponse.json();
    console.log("Fotor task status:", statusData.data?.status);

    if (statusData.code !== '000') {
      throw new Error(`Task error: ${statusData.msg}`);
    }

    const status = statusData.data?.status;
    
    // status 1 = completed, status 2 = failed
    if (status === 1) {
      const resultUrl = statusData.data?.resultUrl;
      if (!resultUrl) {
        throw new Error('No result URL in completed task');
      }
      console.log("Background removed, result URL:", resultUrl);
      return resultUrl;
    } else if (status === 2) {
      throw new Error("Fotor task failed");
    }

    attempts++;
  }

  throw new Error("Fotor task timed out");
}

async function fetchImageAsBase64(url: string): Promise<string> {
  console.log("Downloading result image:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64 = base64Encode(uint8Array);
  console.log("Image downloaded, base64 length:", base64.length);
  return `data:image/png;base64,${base64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mainImageUrl, secondImageUrl } = await req.json();

    if (!mainImageUrl || !secondImageUrl) {
      return new Response(JSON.stringify({ error: "Both image URLs are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FOTOR_API_KEY = Deno.env.get("FOTOR_API_KEY");
    if (!FOTOR_API_KEY) {
      throw new Error("FOTOR_API_KEY not configured");
    }

    console.log("Processing images:");
    console.log("Main:", mainImageUrl);
    console.log("Second:", secondImageUrl);

    // Remove backgrounds from both images in parallel
    const [mainResultUrl, secondResultUrl] = await Promise.all([
      removeBackgroundWithFotor(mainImageUrl, FOTOR_API_KEY),
      removeBackgroundWithFotor(secondImageUrl, FOTOR_API_KEY),
    ]);

    // Fetch the result images and convert to base64
    const [mainBase64, secondBase64] = await Promise.all([
      fetchImageAsBase64(mainResultUrl),
      fetchImageAsBase64(secondResultUrl),
    ]);

    console.log("Both images processed successfully");

    return new Response(JSON.stringify({
      success: true,
      mainImage: mainBase64,
      secondImage: secondBase64,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ben-process-images:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Processing failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
