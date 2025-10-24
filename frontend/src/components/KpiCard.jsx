// src/components/KpiCard.js
import React from 'react';

const KpiCard = ({ title, value, unit, change }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      <div className="mt-2 flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-gray-800">{value}</span>
        <span className="text-2xl font-semibold text-gray-500">{unit}</span>
      </div>
      <div className={`text-sm font-medium ${changeColor} mt-1`}>
        {isPositive ? '+' : ''}
        {change}%
      </div>
    </div>
  );
};

export default KpiCard;