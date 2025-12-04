import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function removeBackgroundWithFotor(imageUrl: string): Promise<string> {
  const FOTOR_API_KEY = Deno.env.get("FOTOR_API_KEY");
  if (!FOTOR_API_KEY) {
    throw new Error("FOTOR_API_KEY not configured");
  }

  console.log("Creating Fotor task for image:", imageUrl);

  // Step 1: Create the background removal task
  const createResponse = await fetch("https://api-b.fotor.com/v1/aiart/backgroundremover", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${FOTOR_API_KEY}`,
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

  const taskId = createData.data?.taskId || createData.taskId;
  if (!taskId) {
    throw new Error("No taskId returned from Fotor");
  }

  // Step 2: Poll for task completion
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await fetch(`https://api-b.fotor.com/v1/aiart/backgroundremover/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${FOTOR_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      console.error("Fotor status check error:", statusResponse.status);
      attempts++;
      continue;
    }

    const statusData = await statusResponse.json();
    console.log("Fotor task status:", statusData);

    const status = statusData.data?.status || statusData.status;
    
    if (status === "completed" || status === "success") {
      const resultUrl = statusData.data?.result_url || statusData.data?.resultUrl || statusData.result_url || statusData.resultUrl;
      if (resultUrl) {
        console.log("Background removed, result URL:", resultUrl);
        return resultUrl;
      }
    } else if (status === "failed" || status === "error") {
      throw new Error("Fotor task failed");
    }

    attempts++;
  }

  throw new Error("Fotor task timed out");
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const contentType = response.headers.get("content-type") || "image/png";
  return `data:${contentType};base64,${base64}`;
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

    console.log("Processing images:");
    console.log("Main:", mainImageUrl);
    console.log("Second:", secondImageUrl);

    // Remove backgrounds from both images in parallel
    const [mainResultUrl, secondResultUrl] = await Promise.all([
      removeBackgroundWithFotor(mainImageUrl),
      removeBackgroundWithFotor(secondImageUrl),
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
      error: error instanceof Error ? error.message : "Processing failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
