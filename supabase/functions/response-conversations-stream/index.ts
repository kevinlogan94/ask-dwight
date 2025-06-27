// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "https://esm.sh/openai@5.7.0";
import { DWIGHT_FULL_INSTRUCTIONS } from "./configs/dwight-instructions.ts";

// CORS headers to allow requests from localhost and your production domain
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Be more specific in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, Authorization, Content-Type, x-client-info",
  "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
};

// Main handler function
Deno.serve(async (req) => {
  try {
    // Ensure the OPENAI_API_KEY is set
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set");
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create a new OpenAI client for each request
    const openai = new OpenAI({ apiKey });

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: { ...corsHeaders },
      });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { prompt, responseId } = await req.json();

    const isStringPrompt = typeof prompt === "string" && prompt.trim() !== "";
    const isArrayPrompt = Array.isArray(prompt) && prompt.length > 0;

    if (!isStringPrompt && !isArrayPrompt) {
      return new Response(JSON.stringify({ error: "Prompt must be a non-empty string or a non-empty array of messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1. Create a ReadableStream
    // This stream will be the body of our response. We can push data into it.
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // 2. Start the OpenAI stream
          const stream = await openai.responses.create({
            model: "gpt-4.1-mini",
            instructions: DWIGHT_FULL_INSTRUCTIONS,
            input: prompt,
            temperature: 0.7,
            max_output_tokens: 10000,
            previous_response_id: responseId,
            stream: true,
          });

          // 3. Process the stream events
          for await (const event of stream) {
            if (event.type === "response.output_text.delta" || event.type === "response.completed") {
              const sseChunk = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(sseChunk));
            }
          }
        } catch (error) {
          // Handle errors from the OpenAI stream
          console.error("Error during OpenAI stream:", error);
          const errorChunk = `data: ${JSON.stringify({ error: "Stream error", message: error.message })}\n\n`;
          controller.enqueue(encoder.encode(errorChunk));
        } finally {
          // 5. Close the stream
          controller.close();
        }
      },
      cancel() {
        console.log("Stream cancelled by client.");
      },
    });

    // 6. Return the stream as the response
    // We return a Response object where the body is our readableStream.
    // The headers are crucial to tell the browser how to handle this streaming connection.
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

/* To invoke locally:
  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/response-conversations' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"prompt":"What are the key elements of a good sales pitch?"}'

*/
