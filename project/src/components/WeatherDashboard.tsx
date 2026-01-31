import React, { useEffect, useState } from 'react';
import { CloudSun, Loader, CheckCircle, XCircle, WifiOff } from 'lucide-react';
import type { WeatherData } from '../types';
import { testGeminiAPI } from '../utils/testGeminiAPI';

const API_KEY = 'f5104bfc84337a602495f556b1d99328';
const GEMINI_API_KEY = "AIzaSyBxspH--NA3YUE_XmU9IXv-LIlhm8NzNs4";

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [apiError, setApiError] = useState<string>('');

  useEffect(() => {
    // Check internet connection first
    if (!navigator.onLine) {
      setApiStatus('failed');
      setApiError('No internet connection');
      return;
    }

    // Test Gemini API
    const testAPI = async () => {
      try {
        const isValid = await testGeminiAPI(GEMINI_API_KEY);
        setApiStatus(isValid ? 'success' : 'failed');
        if (!isValid) {
          setApiError('API connection failed - please try again later');
        }
      } catch (error: any) {
        setApiStatus('failed');
        setApiError(error.message || 'API connection failed');
      }
    };

    testAPI();

    // Add online/offline event listeners
    const handleOnline = () => {
      setApiStatus('loading');
      testAPI();
    };

    const handleOffline = () => {
      setApiStatus('failed');
      setApiError('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );

            if (!response.ok) {
              throw new Error('Weather data fetch failed');
            }

            const data = await response.json();
            setWeather({
              city: data.name,
              temperature: Math.round(data.main.temp),
              humidity: data.main.humidity,
              windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
              pressure: data.main.pressure,
              precipitation: data.rain ? data.rain['1h'] || 0 : 0,
              condition: data.weather[0].main
            });
            setLoading(false);
          } catch (err) {
            setError('Failed to fetch weather data');
            setLoading(false);
          }
        },
        () => {
          setError('Please enable location access to view weather data');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Machine Learning Model Status</h2>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Model API:</span>
          {apiStatus === 'loading' && (
            <div className="flex items-center">
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="ml-2 text-blue-500">Checking...</span>
            </div>
          )}
          {apiStatus === 'success' && (
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="ml-2 text-green-500">Connected</span>
            </div>
          )}
          {apiStatus === 'failed' && (
            <div className="flex items-center">
              {!navigator.onLine ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="ml-2 text-red-500">{apiError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Weather Dashboard */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Current Weather</h2>
            {weather && <p className="text-gray-600 mt-1">{weather.city}</p>}
          </div>
          <CloudSun className="w-8 h-8 text-blue-500" />
        </div>

        {weather && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-2xl font-bold text-blue-600">{weather.temperature}°C</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-2xl font-bold text-green-600">{weather.humidity}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Wind Speed</p>
              <p className="text-2xl font-bold text-purple-600">{weather.windSpeed} km/h</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pressure</p>
              <p className="text-2xl font-bold text-orange-600">{weather.pressure} hPa</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Precipitation</p>
              <p className="text-2xl font-bold text-teal-600">{weather.precipitation} mm</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Condition</p>
              <p className="text-2xl font-bold text-indigo-600">{weather.condition}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}