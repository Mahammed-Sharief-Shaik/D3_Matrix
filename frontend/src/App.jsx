// src/App.js
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import KpiCard from "./components/KpiCard";
import ScenarioControls from "./components/ScenarioControls";
import DemandForecast from "./components/DemandForecast";
import ParameterChart from "./components/ParameterChart";
import CityHeatMap from "./components/CityHeatMap";
import axios from "axios";

function App() {
  // These are "globally" available within your component
  // Initialized with realistic placeholder data
  const [currentDemand, setCurrentDemand] = useState(3880.42);
  const [pred5Min, setPred5Min] = useState(3910.1);
  const [predMonth, setPredMonth] = useState(34500000);

  const [formattedCurrent, setFormattedCurrent] = useState({
    Time: "2024-12-11 15:25:00",
    Temperature: "19.3°C",
    "Dew Point": "3.9°C",
    Humidity: "36%",
    "Wind Speed": "13.0 km/h",
    Pressure: "1017.8 hPa",
    "Is Weekend?": "No",
    "Is Holiday?": "No",
    "Monthly Rainy Days": 0, // Using 0 for null
    "Monthly Total Rainfall": 0, // Using 0 for null
    Season: "Winter",
  });

  // Initialized with a few data points for chart rendering
  const [todayData, setTodayData] = useState([
    { name: "10:00", forecast: 4003, historical: 3975 },
    { name: "11:00", forecast: 4017, historical: 4055 },
    { name: "12:00", forecast: 4008, historical: 4052 },
    { name: "13:00", forecast: 3830, historical: 3736 },
    { name: "14:00", forecast: 3813, historical: 3858 },
    { name: "15:00", forecast: 3863, historical: 3880 },
  ]);

  const [monthlyData, setMonthlyData] = useState([
    { name: "Aug", forecast: null, historical: 42250991 },
    { name: "Sep", forecast: null, historical: 37921547 },
    { name: "Oct", forecast: null, historical: 35152555 },
    { name: "Nov", forecast: null, historical: 28827053 },
    { name: "Dec", forecast: null, historical: 13602533 },
  ]);
  //per function to convert month number to short name (e.g., 2 -> "Feb")
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1); // JavaScript months are 0-indexed (0=Jan, 1=Feb)
    return date.toLocaleString("default", { month: "short" });
  };

  // const fetchData = async () => {
  //   try {
  //     // Make the API request
  //     const response = await axios.get(
  //       "http://127.0.0.1:8002/get_live_update_v2"
  //     );
  //     console.log(response);
  //     const data = response.data;

  //     console.log("--- Successfully Fetched Data ---");

  //     // --- 1. Current Power Demand ---
  //     // Note: We must use bracket notation for keys with spaces
  //     setCurrentDemand(data.current_data_5min["Power demand"]);

  //     // --- 2. Predicted 5-min Demand ---
  //     setPred5Min(data.predicted_next_5_min_demand_kw);

  //     // --- 3. Predicted Month Demand ---
  //     setPredMonth(data.predicted_next_month_demand_kw);

  //     // --- 4. Current Conditions ---
  //     // We can still use a local const here, since we don't need 'currentData' outside this block
  //     const currentData = data.current_data_5min;
  //     setFormattedCurrent({
  //       Time: currentData.datetime,
  //       Temperature: `${currentData.temp}°C`,
  //       "Dew Point": `${currentData.dwpt}°C`,
  //       Humidity: `${currentData.rhum}%`,
  //       "Wind Speed": `${currentData.wspd} km/h`,
  //       Pressure: `${currentData.pres} hPa`,
  //       "Is Weekend?": currentData.is_weekend === 1 ? "Yes" : "No",
  //       "Is Holiday?": currentData.is_holiday === 1 ? "Yes" : "No",
  //       "Monthly Rainy Days": currentData.Monthly_Rainy_Days,
  //       "Monthly Total Rainfall": currentData.Monthly_Total_Rainfall,
  //       Season: currentData.season,
  //     });

  //     // --- 5. "Today" Data (from past_24_hours_demand) ---
  //     // We map the data to a temporary variable...
  //     const todayValues = data.past_24_hours_demand
  //       .filter((d) => d.time.endsWith(":00:00"))
  //       .map((d) => ({
  //         name: d.time.split(" ")[1].substring(0, 5),
  //         forecast: null,
  //         historical: d.value,
  //       }));
  //     // ...then set the state
  //     setTodayData(todayValues);

  //     // --- 6. Monthly Data (from past_12_months_demand) ---
  //     // We map the data to another temporary variable...
  //     const monthlyValues = data.past_12_months_demand.map((d) => ({
  //       name: getMonthName(d.month), // Assumes getMonthName is defined
  //       forecast: null,
  //       historical: d.value,
  //     }));
  //     // ...and set the state
  //     setMonthlyData(monthlyValues);
  //     // --- Log all the extracted data ---

  //     console.log("\n--- 1. Current Power Demand ---");
  //     console.log(currentDemand);

  //     console.log("\n--- 2. Predicted 5-Min Demand ---");
  //     console.log(pred5Min);

  //     console.log("\n--- 3. Predicted Month Demand ---");
  //     console.log(predMonth);

  //     console.log("\n--- 4. Current Conditions ---");
  //     console.log(formattedCurrent);

  //     console.log("\n--- 5. Hourly Data (from past 24h) ---");
  //     console.log(JSON.stringify(todayData, null, 2));

  //     console.log("\n--- 6. Monthly Data (from past 12m) ---");
  //     console.log(JSON.stringify(monthlyData, null, 2));
  //   } catch (error) {
  //     if (error.response) {
  //       // The request was made and the server responded with a status code
  //       // that falls out of the range of 2xx
  //       console.error(
  //         "Error fetching data (server responded):",
  //         error.response.status,
  //         error.response.data
  //       );
  //     } else if (error.request) {
  //       // The request was made but no response was received
  //       console.error("Error fetching data (no response):", error.request);
  //     } else {
  //       // Something happened in setting up the request
  //       console.error("Error setting up request:", error.message);
  //     }
  //   }
  // };

  // Assuming 'fetchData' is the async function you defined in the previous step
  // import { fetchData } from './api'; // (or wherever it is)

  // useEffect(async () => {
  //   // We call your function inside the useEffect's callback
  //  // await fetchData();
  // }, []); // <-- The empty array is crucial. It means "run only once on mount".
  // // This data would come from your backend API
  const forecastData = {
    peakDemand: 3119.45,
    peakDemandChange: 2.3,
    annualDemand: 3155.78,
    annualDemandChange: 1.8,
    conservation: 18.5,
    conservationChange: -0.7,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Header />

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KpiCard
            title="Current Demand"
            value={currentDemand}
            unit="kW"
            change={forecastData.peakDemandChange}
          />
          <KpiCard
            title="Projected Demand (5 mins)"
            value={pred5Min}
            unit="kW"
            change={forecastData.annualDemandChange}
          />
          <KpiCard
            title="Projected Demand (Next Month)"
            value={predMonth}
            unit="kW"
            change={forecastData.conservationChange}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Controls */}
          <div className="lg:col-span-3">
            <ScenarioControls />
          </div>

          {/* Right Column: Graph */}
          <div className="lg:col-span-3">
            <DemandForecast />
          </div>

          {/* <div className="lg:col-span-1 min-h-screen bg-gray-50 flex flex-col items-center ">
            <ParameterChart />
          </div> */}
          <div className="lg:col-span-2 ">
            <CityHeatMap />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
