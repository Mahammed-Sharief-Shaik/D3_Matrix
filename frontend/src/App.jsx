// src/App.js
import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import ScenarioControls from './components/ScenarioControls';
import DemandForecast from './components/DemandForecast';

function App() {
  // This data would come from your backend API
  const forecastData = {
    peakDemand: 245,
    peakDemandChange: 2.3,
    annualDemand: 2.8,
    annualDemandChange: 1.8,
    conservation: 18.5,
    conservationChange: -0.7,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Header />

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KpiCard
            title="Current Peak Demand"
            value={forecastData.peakDemand}
            unit="MW"
            change={forecastData.peakDemandChange}
          />
          <KpiCard
            title="Projected Annual Demand"
            value={forecastData.annualDemand}
            unit="TWh"
            change={forecastData.annualDemandChange}
          />
          <KpiCard
            title="Conservation Potential"
            value={forecastData.conservation}
            unit="%"
            change={forecastData.conservationChange}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-1">
            <ScenarioControls />
          </div>

          {/* Right Column: Graph */}
          <div className="lg:col-span-2">
            <DemandForecast />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;