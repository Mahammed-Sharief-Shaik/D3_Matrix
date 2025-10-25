import React, { useState } from "react";

// Updated SliderInput to accept min, max, and step as props
const SliderInput = ({ label, value, unit, onChange, min, max, step }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm font-bold text-blue-600">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

// Re-adding SelectInput for the new categorical parameters
const SelectInput = ({ label, value, options, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ScenarioControls = () => {
  // --- States from first image ---
  const [temp, setTemp] = useState(8.0);
  const [dwpt, setDwpt] = useState(6.9);
  const [rhum, setRhum] = useState(93.0);
  const [wspd, setWspd] = useState(0.0);
  const [pres, setPres] = useState(1017.0);

  // --- New time state (replaces hour and minute) ---
  const [time, setTime] = useState("00:30"); // Default "HH:mm" format

  // --- States from second image ---
  // Using 0 for "No" and 1 for "Yes"
  const [isWeekend, setIsWeekend] = useState(0);
  const [isHoliday, setIsHoliday] = useState(0);
  const [rainyDays, setRainyDays] = useState(5.0);
  const [totalRainfall, setTotalRainfall] = useState(56.6);
  const [season, setSeason] = useState("Winter");

  // Removed submittedData state

  // Updated handleSubmit function to send all parameters
  const handleSubmit = async () => {
    // Parse time string "HH:mm" into numbers
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const dataToSubmit = {
      // From first image (weather)
      temp,
      dwpt,
      rhum,
      wspd,
      pres,
      // From first image (time)
      hour,
      minute,
      // From second image
      Is_weekend: isWeekend,
      Is_holiday: isHoliday,
      Monthly_Rainy_Days: rainyDays,
      Monthly_Total_Rainfall: totalRainfall,
      season,
    };

    // 1. Update the local UI state
    // setSubmittedData(dataToSubmit); // Removed as requested

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
        throw new Error();
      }

      const result = await response.json();
      console.log("API Response:", result);
      // e.g., setPredictionResult(result);
    } catch (error) {
      console.error("Error sending data to backend:", error);
      // e.g., setApiError(error.message);
    }
  };

  return (
    // Main container: 1 single box
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Scenario Controls
      </h2>

      {/* Inner grid for the 3 columns of inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
        {/* Column 1: Temporal Factors */}
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Temporal Factors
          </h3>
          {/* --- Time Input (replaces sliders) --- */}
          <div className="mb-4">
            {" "}
            {/* Was mb-6 */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <SelectInput
            label="Is Weekend?"
            value={isWeekend}
            // Using parseFloat for state consistency, though 0/1 are numbers
            onChange={(val) => setIsWeekend(parseFloat(val))}
            options={[
              { label: "No", value: 0 },
              { label: "Yes", value: 1 },
            ]}
          />
          <SelectInput
            label="Is Holiday?"
            value={isHoliday}
            onChange={(val) => setIsHoliday(parseFloat(val))}
            options={[
              { label: "No", value: 0 },
              { label: "Yes", value: 1 },
            ]}
          />
        </div>

        {/* Column 2: Meteorological Data */}
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Meteorological Data
          </h3>
          {/* --- Weather Inputs (from first image) --- */}
          <SliderInput
            label="Temperature"
            value={temp}
            unit="°C"
            onChange={setTemp}
            min="-10"
            max="50"
            step="0.1"
          />
          <SliderInput
            label="Dew Point"
            value={dwpt}
            unit="°C"
            onChange={setDwpt}
            min="-10"
            max="50"
            step="0.1"
          />
          <SliderInput
            label="Humidity"
            value={rhum}
            unit="%"
            onChange={setRhum}
            min="0"
            max="100"
            step="0.1"
          />
          <SliderInput
            label="Wind Speed"
            value={wspd}
            unit=" km/h"
            onChange={setWspd}
            min="0"
            max="100"
            step="0.1"
          />
          <SliderInput
            label="Pressure"
            value={pres}
            unit=" hPa"
            onChange={setPres}
            min="950"
            max="1050"
            step="0.1"
          />
        </div>

        {/* Column 3: Contextual Factors */}
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Contextual Factors
          </h3>
          {/* --- Inputs from second image --- */}
          <SliderInput
            label="Monthly Rainy Days"
            value={rainyDays}
            unit=" days"
            onChange={setRainyDays}
            min="0"
            max="31"
            step="0.1"
          />
          <SliderInput
            label="Monthly Total Rainfall"
            value={totalRainfall}
            unit=" mm"
            onChange={setTotalRainfall}
            min="0"
            max="1000" // Assuming a high max for rainfall
            step="0.1"
          />
          <SelectInput
            label="Season"
            value={season}
            onChange={setSeason}
            options={[
              { label: "Winter", value: "Winter" },
              { label: "Spring", value: "Spring" },
              { label: "Summer", value: "Summer" },
              { label: "Autumn", value: "Autumn" },
            ]}
          />
        </div>
      </div>

      {/* --- Submit Button (Centered) --- */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="w-full md:w-1/3 lg:w-1/4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Submit
        </button>
      </div>

      {/* Removed submitted data display as requested */}
    </div>
  );
};

export default ScenarioControls;
