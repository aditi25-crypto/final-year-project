import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = 'AIzaSyBPCRPQHJe0Wd5Vd7JQZEQVnGxZZVNVaQY';

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "Hello! Please respond with 'API is working!' if you receive this message.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('API Response:', text);
    console.log('✅ API test successful!');
    return true;
  } catch (error: any) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Run the test
testGeminiAPI();