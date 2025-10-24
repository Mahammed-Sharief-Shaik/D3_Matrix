// src/components/Header.js
import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">EnergyForecast</h1>
      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Save Scenario
      </button>
    </header>
  );
};

export default Header;