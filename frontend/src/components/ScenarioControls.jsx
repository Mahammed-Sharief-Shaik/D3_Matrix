// src/components/ScenarioControls.js
import React, { useState } from "react";

const SliderInput = ({ label, value, unit, onChange }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm font-bold text-blue-600">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      step="0.1"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

const SelectInput = ({ label, value, options, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const ScenarioControls = () => {
  // Individual states for all inputs
  const [population, setPopulation] = useState(2.1);
  const [economic, setEconomic] = useState(3.2);
  const [renewable, setRenewable] = useState(28);
  const [efficiency, setEfficiency] = useState("Medium");
  const [climate, setClimate] = useState("Moderate");

  const [submittedData, setSubmittedData] = useState(null);

  // Updated handleSubmit function
  const handleSubmit = async () => {
    const dataToSubmit = {
      population,
      economic,
      renewable,
      efficiency,
      climate,
    };

    // 1. Update the local UI state (as before)
    setSubmittedData(dataToSubmit);

    // 2. Send the data to the backend API
    try {
      const response = await fetch(
        "http://localhost:4284/api/karthik/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Assuming the backend sends back a JSON response (e.g., the prediction)
      const result = await response.json();
      console.log("API Response:", result);
      // You could add new state here to display the prediction result
      // e.g., setPredictionResult(result);
    } catch (error) {
      console.error("Error sending data to backend:", error);
      // You could add new state here to display an error message to the user
      // e.g., setApiError(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Scenario Controls
      </h2>

      <SliderInput
        label="Population Growth Rate"
        value={population}
        unit="%"
        onChange={setPopulation}
      />
      <SliderInput
        label="Economic Growth"
        value={economic}
        unit="%"
        onChange={setEconomic}
      />
      <SliderInput
        label="Renewable Adoption"
        value={renewable}
        unit="%"
        onChange={setRenewable}
      />

      <SelectInput
        label="Energy Efficiency"
        value={efficiency}
        options={["Low", "Medium", "High"]}
        onChange={setEfficiency}
      />

      <SelectInput
        label="Climate Scenario"
        value={climate}
        options={["Mild", "Moderate", "Severe"]}
        onChange={setClimate}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
      >
        Submit
      </button>

      {submittedData && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Selected Parameters
          </h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              Population Growth Rate:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.population}%
              </span>
            </li>
            <li>
              Economic Growth:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.economic}%
              </span>
            </li>
            <li>
              Renewable Adoption:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.renewable}%
              </span>
            </li>
            <li>
              Energy Efficiency:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.efficiency}
              </span>
            </li>
            <li>
              Climate Scenario:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.climate}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScenarioControls;
