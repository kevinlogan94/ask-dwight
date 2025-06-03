// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { OpenAI } from 'https://esm.sh/openai@4.35.0'
import { DWIGHT_FULL_INSTRUCTIONS } from "./configs/dwight-instructions"

// CORS headers to allow requests from localhost and your production domain
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Be more specific in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, Authorization, Content-Type, x-client-info",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
};

// Create a single OpenAI client instance
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

// Main handler function
Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: { ...corsHeaders },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages must be an array' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Prepare chat messages with system prompt
    const chatMessages = [
      { role: "system", content: DWIGHT_FULL_INSTRUCTIONS },
      ...messages,
    ]

    // Create chat completion with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 10000,
    })

    // Process response if valid
    if (response.choices?.length > 0 && response.choices[0].message) {
      return new Response(
        JSON.stringify({ 
          message: response.choices[0].message,
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid response structure from OpenAI' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Error processing request' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-conversations' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"messages":[{"role":"user","content":"How can I improve my cold emails?"}]}'

*/
