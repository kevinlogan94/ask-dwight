// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// CORS headers to allow requests from localhost and your production domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Be more specific in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'apikey, Authorization, Content-Type, x-client-info',
  'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {...corsHeaders},
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { level, message, user_id, session_id } = await req.json()

  if (!level || !message) {
    console.error("Missing `level` or `message`");
    return new Response("Missing `level` or `message`", { status: 400, headers: {...corsHeaders}});
  }

  const { error } = await supabase.from("application_logs").insert([
    { level, message, user_id, session_id }
  ])

  if (error) {
    console.error("Error storing log:", error);
    return new Response(JSON.stringify({ error }), { status: 500, headers: {...corsHeaders}});
  }

  return new Response("OK", { status: 200, headers: {...corsHeaders}});
})
