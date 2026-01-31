import React, { useState } from 'react';
import { Cloud, CloudLightning, Compass, Home } from 'lucide-react';
import WeatherDashboard from './components/WeatherDashboard';
import PredictionForm from './components/PredictionForm';
import { predictDisaster } from './lib/gemini';

import type { PredictionResult } from './types';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'cyclone', label: 'Cyclone', icon: Compass },
  { id: 'earthquake', label: 'Earthquake', icon: CloudLightning },
  { id: 'cloudburst', label: 'Cloudburst', icon: Cloud }
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [predictions, setPredictions] = useState<Record<string, PredictionResult | null>>({
    cyclone: null,
    earthquake: null,
    cloudburst: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = async (type: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictDisaster(type, data);
      setPredictions(prev => ({ ...prev, [type]: result }));
    } catch (error: any) {
      console.error('Prediction failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formFields = {
    cyclone: [
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'seaSurfaceTemp', label: 'Sea Surface Temperature (°C)', type: 'number', step: 0.1, required: true },
      { name: 'pressure', label: 'Air Pressure (hPa)', type: 'number', required: true },
      { name: 'windSpeed', label: 'Wind Speed (km/h)', type: 'number', required: true },
      { name: 'humidity', label: 'Humidity (%)', type: 'number', min: 0, max: 100, required: true }
    ],
    earthquake: [
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'seismicActivity', label: 'Recent Seismic Activity (Magnitude)', type: 'number', step: 0.1 },
      { name: 'tectonicMovement', label: 'Tectonic Plate Movement (mm/year)', type: 'number', step: 0.1 }
    ],
    cloudburst: [
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'precipitationRate', label: 'Precipitation Rate (mm/hour)', type: 'number', step: 0.1, required: true },
      { name: 'cloudDensity', label: 'Cloud Density (g/m³)', type: 'number', step: 0.01, required: true },
      { name: 'pressure', label: 'Atmospheric Pressure (hPa)', type: 'number', required: true },
      { name: 'humidity', label: 'Humidity (%)', type: 'number', min: 0, max: 100, required: true }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <CloudLightning className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">DisasterPredict</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2
                  ${activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' ? (
          <WeatherDashboard />
        ) : (
          <PredictionForm
            title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Prediction`}
            fields={formFields[activeTab as keyof typeof formFields]}
            onSubmit={(data) => handlePrediction(activeTab, data)}
            result={predictions[activeTab]}
            loading={loading}
            error={error}
          />
        )}
      </main>
    </div>
  );
}

export default App;