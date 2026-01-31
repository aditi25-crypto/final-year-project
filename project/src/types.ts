export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
  condition: string;
  city: string;
}

export interface PredictionResult {
  likelihood: 'Low' | 'Moderate' | 'High';
  confidenceScore: number;
  explanation: string;
}

export interface CycloneInputs {
  city: string;
  seaSurfaceTemp: number;
  pressure: number;
  windSpeed: number;
  humidity: number;
}

export interface EarthquakeInputs {
  city: string;
  seismicActivity?: number;
  tectonicMovement?: number;
}

export interface CloudburstInputs {
  city: string;
  precipitationRate: number;
  cloudDensity: number;
  pressure: number;
  humidity: number;
}