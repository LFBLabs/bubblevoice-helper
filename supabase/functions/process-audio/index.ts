import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common greetings patterns
const greetingPatterns = [
  /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what'?s up|yo|hiya|greetings)/i,
];

// Quick greeting responses (under 50 chars)
const greetingResponses = [
  "Hi! How can I help you with Bubble.io today?",
  "Hello! Ready to help with Bubble.io!",
  "Hey there! Let's talk about Bubble.io!",
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { text } = requestData;
    
    console.log('Received request with text:', text);

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid or empty text input');
    }

    console.log('Processing text input:', text);
    let responseText: string;

    // Check if input is a greeting
    const isGreeting = greetingPatterns.some(pattern => pattern.test(text.trim()));

    if (isGreeting) {
      // Quickly return a random greeting response
      responseText = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      console.log('Greeting detected, sending quick response');
    } else {
      // Process regular Bubble.io related question
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      if (!genAI) {
        throw new Error('Failed to initialize Gemini AI');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        { text: "You are a helpful voice assistant that explains Bubble.io concepts. Keep responses under 400 characters. Be direct and concise. Focus on the most important information. Avoid unnecessary details. Never use special characters or asterisks." },
        { text }
      ]);

      if (!result || !result.response) {
        throw new Error('Failed to generate AI response');
      }

      const response = await result.response;
      responseText = response.text().slice(0, 400);
      console.log('Technical response generated, length:', responseText.length);
    }

    // Initialize AWS Polly with optimal configuration for high-quality speech
    console.log('Initializing AWS Polly...');
    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
      }
    });

    if (!polly) {
      throw new Error('Failed to initialize AWS Polly');
    }

    console.log('Synthesizing speech with AWS Polly...');

    // Convert text to speech using AWS Polly with neural voice engine
    const speechResponse = await polly.synthesizeSpeech({
      Text: `<speak><prosody rate="95%">${responseText}</prosody></speak>`,
      OutputFormat: "mp3",
      VoiceId: "Joanna",
      Engine: "neural",
      TextType: "ssml",
      SampleRate: "24000"
    });

    if (!speechResponse.AudioStream) {
      throw new Error('No audio stream returned from AWS Polly');
    }

    console.log('Successfully generated audio stream');

    // Convert audio stream to base64
    const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
    const audioBase64 = btoa(String.fromCharCode(...audioData));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log('Successfully converted audio to base64');

    return new Response(
      JSON.stringify({ 
        response: responseText,
        audioUrl
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in process-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});