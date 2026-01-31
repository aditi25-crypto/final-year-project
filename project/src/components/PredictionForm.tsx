import React from 'react';
import type { PredictionResult } from '../types';

interface PredictionFormProps {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
  }>;
  onSubmit: (data: any) => void;
  result: PredictionResult | null;
  loading: boolean;
  error: string | null;
}

export default function PredictionForm({
  title,
  fields,
  onSubmit,
  result,
  loading,
  error
}: PredictionFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              min={field.min}
              max={field.max}
              step={field.step}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Predict'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-100 text-red-800">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Prediction Result</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${result.likelihood === 'Low' ? 'bg-green-100 text-green-800' :
                result.likelihood === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}>
              {result.likelihood} Risk
            </span>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${result.confidenceScore}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-600 mt-1">
              {result.confidenceScore}%
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Explanation</div>
            <p className="text-gray-800">{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}