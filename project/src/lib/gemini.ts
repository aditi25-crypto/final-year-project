import { GoogleGenerativeAI } from "@google/generative-ai";
import { testGeminiAPI } from "../utils/testGeminiAPI";

// Get API key from environment variables
const GEMINI_API_KEY = "AIzaSyBxspH--NA3YUE_XmU9IXv-LIlhm8NzNs4";

if (!GEMINI_API_KEY) {
  throw new Error('Gemini API key is not set. Please set VITE_GEMINI_API_KEY in your .env file.');
}

// Test API key before initializing
let apiKeyTested = false;

// Initialize the API with safety settings
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function predictDisaster(type: string, data: any) {
  // Test API key on first use
  if (!apiKeyTested) {
    const isValid = await testGeminiAPI(GEMINI_API_KEY);
    if (!isValid) {
      throw new Error('Invalid Gemini API key. Please check your API key in the .env file.');
    }
    apiKeyTested = true;
  }

  // Validate input data
  if (!data.city || typeof data.city !== 'string') {
    throw new Error('City is required and must be a string');
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  let prompt = "";
  switch (type) {
    case "cyclone":
      if (!data.seaSurfaceTemp || !data.pressure || !data.windSpeed || !data.humidity) {
        throw new Error('Missing required parameters for cyclone prediction');
      }
      prompt = `You are a disaster prediction AI. Based on the following weather conditions in ${data.city}:
        - Sea Surface Temperature: ${data.seaSurfaceTemp}°C
        - Air Pressure: ${data.pressure} hPa
        - Wind Speed: ${data.windSpeed} km/h
        - Humidity: ${data.humidity}%
        
        Analyze the likelihood of a cyclone formation. You must respond with valid JSON in this exact format:
        {
          "likelihood": "Low|Moderate|High",
          "confidenceScore": <number between 60-100>,
          "explanation": "<detailed explanation of the risk assessment>"
        }
        
        Do not include any other text in your response, only the JSON object.`;
      break;

    case "earthquake":
      prompt = `You are a disaster prediction AI. For the city of ${data.city}, considering:
        ${data.seismicActivity ? `- Recent Seismic Activity: ${data.seismicActivity} magnitude` : ''}
        ${data.tectonicMovement ? `- Tectonic Plate Movement: ${data.tectonicMovement} mm/year` : ''}
        
        Analyze the likelihood of an earthquake. You must respond with valid JSON in this exact format:
        {
          "likelihood": "Low|Moderate|High",
          "confidenceScore": <number between 60-100>,
          "explanation": "<detailed explanation of the risk assessment>"
        }
        
        Do not include any other text in your response, only the JSON object.`;
      break;

    case "cloudburst":
      if (!data.precipitationRate || !data.cloudDensity || !data.pressure || !data.humidity) {
        throw new Error('Missing required parameters for cloudburst prediction');
      }
      prompt = `You are a disaster prediction AI. Based on the following atmospheric conditions in ${data.city}:
        - Precipitation Rate: ${data.precipitationRate} mm/hour
        - Cloud Density: ${data.cloudDensity} g/m³
        - Atmospheric Pressure: ${data.pressure} hPa
        - Humidity: ${data.humidity}%
        
        Analyze the likelihood of a cloudburst. You must respond with valid JSON in this exact format:
        {
          "likelihood": "Low|Moderate|High",
          "confidenceScore": <number between 60-100>,
          "explanation": "<detailed explanation of the risk assessment>"
        }
        
        Do not include any other text in your response, only the JSON object.`;
      break;

    default:
      throw new Error("Invalid disaster type");
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log('AI response text:', text); // Log the raw AI response

    try {
      // Clean up the response text
      const cleanedText = text.replace(/```json|```/g, '').replace(/\s+/g, ' ').trim();
      console.log('Cleaned AI response text:', cleanedText); // Log the cleaned AI response

      const parsedResponse = JSON.parse(cleanedText);

      // Validate response format
      if (!parsedResponse.likelihood || !parsedResponse.confidenceScore || !parsedResponse.explanation) {
        throw new Error('Invalid response format from AI');
      }

      if (!['Low', 'Moderate', 'High'].includes(parsedResponse.likelihood)) {
        throw new Error('Invalid likelihood value');
      }

      if (typeof parsedResponse.confidenceScore !== 'number' ||
        parsedResponse.confidenceScore < 60 ||
        parsedResponse.confidenceScore > 100) {
        throw new Error('Invalid confidence score');
      }

      return parsedResponse;
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      console.error('Parsing error:', error || error);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  } catch (error: any) {
    console.error('Gemini API error:', error.message || error);
    throw new Error(error.message || "Failed to get prediction. Please try again.");
  }
}