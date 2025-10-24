import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { paramData } from "../utils/paramData";

// Reusable Tab Button
const TabButton = ({ label, activeTab, onClick }) => {
  const isActive = activeTab === label;
  return (
    <button
      onClick={() => onClick(label)}
      className={`py-2 px-4 rounded-lg text-sm font-medium ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      } transition-all`}
    >
      {label}
    </button>
  );
};

const ParameterChart = () => {
  const [selectedParam, setSelectedParam] = useState("Temperature");
  const [activeTab, setActiveTab] = useState("Daily");

  const handleParamChange = (e) => setSelectedParam(e.target.value);
  const handleTabClick = (tab) => setActiveTab(tab);

  const data = paramData[selectedParam][activeTab];

  return (
    <div className="bg-white ml-6 p-6 rounded-xl shadow-sm h-full">
      {/* Top Section: Dropdown + Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Left - Parameter Dropdown */}
        <select
          value={selectedParam}
          onChange={handleParamChange}
          className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(paramData).map((param) => (
            <option key={param} value={param}>
              {param}
            </option>
          ))}
        </select>

        {/* Right - Time Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {["Daily", "Weekly", "Monthly", "Annual"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              activeTab={activeTab}
              onClick={handleTabClick}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">
        {selectedParam} — {activeTab} Forecast
      </h2>

      {/* Chart */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#2563eb"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Forecast"
            />
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Historical"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ParameterChart;
