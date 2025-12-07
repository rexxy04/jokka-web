// components/eo/SalesChart.tsx
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SalesChartProps {
  data: { name: string; total: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  
  // Format Rupiah untuk Tooltip
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Custom Tooltip agar terlihat modern
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E2230] p-4 rounded-xl border border-gray-700 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-indigo-400 font-bold text-lg">
            {formatRupiah(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
          
          <XAxis 
            dataKey="name" 
            stroke="#718096" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          
          <YAxis 
            stroke="#718096" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`} // Singkat angka (cth: 100k)
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2D3748', opacity: 0.4 }} />
          
          <Bar 
            dataKey="total" 
            fill="url(#colorTotal)" 
            radius={[6, 6, 0, 0]} 
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#6366f1' : '#2D3748'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;