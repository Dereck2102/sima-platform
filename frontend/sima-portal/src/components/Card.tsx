import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { direction: 'up' | 'down'; value: number };
}

export const Card: React.FC<CardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last month
            </p>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
};
