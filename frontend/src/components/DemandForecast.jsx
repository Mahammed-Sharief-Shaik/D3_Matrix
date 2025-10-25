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

// 1. Updated imports to include all 4 data types
import {
  todayData,
  monthlyData
} from "../utils/tempData"; // Assuming this is the correct path to your data file

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

const DemandForecast = () => {
  // Set default tab to 'Monthly'
  const [activeTab, setActiveTab] = useState("Monthly");
  const [chartData, setChartData] = useState(monthlyData);

  // 2. Updated click handler for all 4 tabs
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);

    // Use a switch statement for cleaner logic
    switch (tabName) {
      case "Today":
        setChartData(todayData);
        break;
      case "Monthly":
        setChartData(monthlyData);
        break;
      default:
        setChartData(monthlyData); // Default to monthly
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      {/* Header with Tabs */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Demand Forecast</h2>

        {/* 3. Updated tab buttons in the UI */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <TabButton
            label="Today"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
          <TabButton
            label="Monthly"
            activeTab={activeTab}
            onClick={handleTabClick}
          />
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData} // Data is now correctly dynamic
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#2563eb" // Blue
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Forecast"
            />
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#9ca3af" // Gray
              strokeWidth={2}
              strokeDasharray="5 5" // Dashed line
              name="Historical"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DemandForecast;
