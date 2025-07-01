import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "https://esm.sh/openai@5.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, Authorization, Content-Type, x-client-info",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

    // Create a new OpenAI client
    const openai = new OpenAI({ apiKey });

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Extract file from multipart form-data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    // Upload the file to OpenAI
    const openaiFile = await openai.files.create({
      file: file,
      purpose: "user_data",
    });

    // Return the new file ID
    return new Response(JSON.stringify({ fileId: openaiFile.id }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
