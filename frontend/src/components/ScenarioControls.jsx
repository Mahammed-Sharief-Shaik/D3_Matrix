import React, { useState } from "react";

// Updated SliderInput to accept min, max, and step as props
const SliderInput = ({ label, value, unit, onChange, min, max, step }) => (
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
  
  // --- New time states (from first image) ---
  const [hour, setHour] = useState(0); // From image: 0
  const [minute, setMinute] = useState(30); // From image: 30

  // --- States from second image ---
  // Using 0 for "No" and 1 for "Yes"
  const [isWeekend, setIsWeekend] = useState(0);
  const [isHoliday, setIsHoliday] = useState(0);
  const [rainyDays, setRainyDays] = useState(5.0);
  const [totalRainfall, setTotalRainfall] = useState(56.6);
  const [season, setSeason] = useState("Winter");

  const [submittedData, setSubmittedData] = useState(null);

  // Updated handleSubmit function to send all parameters
  const handleSubmit = async () => {
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

      const result = await response.json();
      console.log("API Response:", result);
      // e.g., setPredictionResult(result);
    } catch (error) {
      console.error("Error sending data to backend:", error);
      // e.g., setApiError(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Scenario Controls
      </h2>

      {/* --- Time Inputs --- */}
      <SliderInput
        label="Hour of Day"
        value={hour}
        unit="" // No unit for hour
        onChange={setHour}
        min="0"
        max="23"
        step="1"
      />
      <SliderInput
        label="Minute"
        value={minute}
        unit="" // No unit for minute
        onChange={setMinute}
        min="0"
        max="59"
        step="1" // Step by 1 minute
      />

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

      {/* --- Inputs from second image --- */}
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

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
      >
        Submit
      </button>

      {/* Updated submitted data display */}
      {submittedData && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Selected Parameters
          </h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {/* Time */}
            <li>
              Time:{" "}
              <span className="font-medium text-blue-700">
                {String(submittedData.hour).padStart(2, "0")}:
                {String(submittedData.minute).padStart(2, "0")}
              </span>
            </li>
            {/* From first image */}
            <li>
              Temperature:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.temp}°C
              </span>
            </li>
            <li>
              Dew Point:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.dwpt}°C
              </span>
            </li>
            <li>
              Humidity:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.rhum}%
              </span>
            </li>
            <li>
              Wind Speed:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.wspd} km/h
              </span>
            </li>
            <li>
              Pressure:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.pres} hPa
              </span>
            </li>
            {/* From second image */}
            <li>
              Is Weekend:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.Is_weekend ? "Yes" : "No"}
              </span>
            </li>
            <li>
              Is Holiday:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.Is_holiday ? "Yes" : "No"}
              </span>
            </li>
            <li>
              Monthly Rainy Days:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.Monthly_Rainy_Days} days
              </span>
            </li>
            <li>
              Monthly Total Rainfall:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.Monthly_Total_Rainfall} mm
              </span>
            </li>
            <li>
              Season:{" "}
              <span className="font-medium text-blue-700">
                {submittedData.season}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScenarioControls;

