import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  // Kita buat opsional dengan default color biar gak ribet
  textColor?: string; 
  borderColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  textColor = "text-gray-900", 
  borderColor = "border-l-gray-300" 
}) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

export default StatCard;