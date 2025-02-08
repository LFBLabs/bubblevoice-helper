
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { greetingPatterns, greetingResponses, thankYouResponses } from "./ai-config.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { calculateTextComplexity } from "./text-complexity.ts";

export async function handleTextResponse(text: string) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid or empty text input');
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate hash for caching
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const questionHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Check cache
  const { data: cachedResponse } = await supabase
    .from('response_cache')
    .select('response')
    .eq('question_hash', questionHash)
    .single();

  if (cachedResponse) {
    console.log('Cache hit in text handler');
    return preprocessResponseForSpeech(cachedResponse.response);
  }

  // Process greetings
  const lowerText = text.toLowerCase();
  for (const pattern of greetingPatterns) {
    if (pattern.test(lowerText)) {
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      return preprocessResponseForSpeech(randomResponse);
    }
  }

  // Process thank you messages
  if (lowerText.includes('thank you') || lowerText.includes('thanks')) {
    const randomResponse = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
    return preprocessResponseForSpeech(randomResponse);
  }

  try {
    // First try to get the API key from environment variables
    let geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiKey) {
      console.log('Gemini API key not found in environment variables, checking database...');
      // If not in env, try to get from database
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('gemini_key')
        .single();

      if (apiKeyError) {
        console.error('Error fetching Gemini API key from database:', apiKeyError);
        throw new Error('Failed to fetch Gemini API key');
      }

      if (!apiKeyData?.gemini_key) {
        console.error('No Gemini API key found in database');
        throw new Error('Gemini API key not configured');
      }

      geminiKey = apiKeyData.gemini_key;
    }

    if (!geminiKey) {
      throw new Error('No Gemini API key available');
    }

    // Calculate text complexity
    const complexity = calculateTextComplexity(text);
    console.log('Text complexity score:', complexity);

    // Initialize Gemini with the API key
    console.log('Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Selected model: gemini-pro');
    
    // Set max words based on complexity
    const maxWords = complexity >= 3 ? 150 : 50;

    const prompt = `You are a helpful assistant specializing in Bubble dot io. 
    Provide clear, concise answers about Bubble dot io's features, capabilities, and best practices.
    Keep responses focused and under ${maxWords} words.
    
    Question: ${text}`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    console.log('Successfully generated response from Gemini');
    return preprocessResponseForSpeech(responseText);

  } catch (error) {
    console.error('Error generating response with Gemini:', error);
    throw error;
  }
}

function preprocessResponseForSpeech(text: string): string {
  // Replace "Bubble.io" with "Bubble dot io" for better speech synthesis
  return text.replace(/Bubble\.io/gi, 'Bubble dot io');
}
