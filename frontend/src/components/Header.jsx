// src/components/Header.js
import React, { useState } from 'react';

const Header = () => {
  // State still defaults to 'delhi'
  const [selectedCity, setSelectedCity] = useState('delhi');

  // This handler will now only be called when 'Delhi' is selected,
  // as the other option is disabled.
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">EnergyForecast</h1>
      
      {/* City selection dropdown */}
      <div>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          aria-label="Select city"
        >
          {/* Default and only selectable option */}
          <option value="delhi">Delhi</option>
          
          {/* Disabled option to show what's planned */}
          <option value="comingsoon" disabled>
            More cities (Coming Soon)
          </option>
        </select>
      </div>
    </header>
  );
};

export default Header;