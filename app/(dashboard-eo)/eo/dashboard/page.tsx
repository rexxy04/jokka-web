import React from 'react';
import StatCard from '@/components/ui/StatCard';

const statsData = [
  { label: "Total Event Aktif", value: "3", color: "text-indigo-600", border: "border-l-indigo-500" },
  { label: "Tiket Terjual", value: "128", color: "text-green-600", border: "border-l-green-500" },
  { label: "Pendapatan Bersih", value: "Rp 4.5jt", color: "text-blue-600", border: "border-l-blue-500" },
  { label: "Menunggu Approval", value: "1", color: "text-orange-500", border: "border-l-orange-400" },
];

export default function EODashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, lihat performa event Anda hari ini.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard 
            key={index}
            label={stat.label}
            value={stat.value}
            textColor={stat.color}
            borderColor={stat.border}
          />
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
        <p className="text-gray-400 italic">Grafik Penjualan akan tampil di sini (Integration Soon)</p>
      </div>
    </div>
  );
}