// src/components/Sidebar.js
import React from 'react';
import { HiOutlineLightningBolt } from 'react-icons/hi'; // Example icon

const Sidebar = () => {
  return (
    <div className="w-18 bg-gray-900 h-screen p-4 flex flex-col items-center">
      {/* Logo Placeholder */}
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-8">
        {/* You could use an icon here */}
        <HiOutlineLightningBolt size={24} />
      </div>
      
      {/* Other nav icons could go here */}
    </div>
  );
};

export default Sidebar;