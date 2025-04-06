import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  try {
    // Get API key from runtime config
    const config = useRuntimeConfig();
    const apiKey = config.openaiApiKey;

    const client = new OpenAI({
      apiKey: process.env.NUXT_PUBLIC_CHATGPT_API_KEY,   
    });

    const response = await client.responses.create({
      model: 'gpt-4o',
      instructions: 'You are a coding assistant that talks like a pirate',
      input: 'Are semicolons optional in JavaScript?',
    });

    return {
      success: true,
      output: response.output_text
    };
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Return error with appropriate HTTP status
    setResponseStatus(event, 500);
    return {
      success: false,
      error: error.message || 'An error occurred while processing your request'
    };
  }
});
