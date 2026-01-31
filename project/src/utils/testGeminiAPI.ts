import { GoogleGenerativeAI } from "@google/generative-ai";

export async function testGeminiAPI(apiKey: string): Promise<boolean> {
  try {
    console.log('Testing Gemini API connection...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Hello! Please respond with 'API is working!' if you receive this message.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text.includes('API is working')) {
      console.log('✅ API test successful!');
      return true;
    } else {
      console.log('❌ API test failed: Unexpected response');
      return false;
    }
  } catch (error: any) {
    // More specific error handling
    const errorMessage = error.message || 'Unknown error';
    if (errorMessage.includes('API key not valid')) {
      console.error('❌ API test failed: Invalid API key');
    } else if (errorMessage.includes('Failed to fetch')) {
      console.error('❌ API test failed: Network connection issue - please check your internet connection');
    } else {
      console.error('❌ API test failed:', errorMessage);
    }
    return false;
  }
}