// src/components/ScenarioControls.js
import React, { useState } from 'react';

// Reusable Input Components for clarity
const SliderInput = ({ label, value, unit }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm font-bold text-blue-600">{value}{unit}</span>
    </div>
    <input
      type="range"
      min="0"
      max="100" // Adjust as needed
      defaultValue={value}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm accent-blue-600"
      // Add onChange/onMouseUp to trigger backend call
    />
  </div>
);

const SelectInput = ({ label, value, options }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      defaultValue={value}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const ScenarioControls = () => {
  // In a real app, this state would be managed
  // and sent to the backend on change.
  const [population, setPopulation] = useState(2.1);
  const [economic, setEconomic] = useState(3.2);
  const [renewable, setRenewable] = useState(28);
  const [efficiency, setEfficiency] = useState('Medium');
  const [climate, setClimate] = useState('Moderate');

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Scenario Controls
      </h2>

      <SliderInput label="Population Growth Rate" value={population} unit="%" />
      <SliderInput label="Economic Growth" value={economic} unit="%" />
      <SliderInput label="Renewable Adoption" value={renewable} unit="%" />

      <SelectInput
        label="Energy Efficiency"
        value={efficiency}
        options={['Low', 'Medium', 'High']}
      />
      
      <SelectInput
        label="Climate Scenario"
        value={climate}
        options={['Mild', 'Moderate', 'Severe']}
      />
    </div>
  );
};

export default ScenarioControls;