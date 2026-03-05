import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, data } = await req.json();

    console.log("=== Mateo Crawl Request ===");
    console.log("Email:", email);
    console.log("Data rows:", Array.isArray(data) ? data.length : 0);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Store request in analytics_events for tracking
    await supabase.from('analytics_events').insert({
      event_type: 'mateo_crawl_request',
      page_path: '/crawling',
      metadata: {
        email,
        row_count: Array.isArray(data) ? data.length : 0,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Crawling request received. Processing will be implemented separately.",
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in mateo-crawl:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
