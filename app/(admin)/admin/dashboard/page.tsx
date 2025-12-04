import React from 'react';
import StatCard from '@/components/ui/StatCard'; // Kita reuse komponen yang sama dengan EO

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Pantau aktivitas platform Jokka secara keseluruhan.</p>
      </div>

      {/* Statistik Dummy (Nanti bisa difetch dari Firebase juga) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="EO Menunggu Verifikasi" 
          value="2" 
          textColor="text-orange-600" 
          borderColor="border-l-orange-500" 
        />
        <StatCard 
          label="Total Partner EO" 
          value="15" 
          textColor="text-blue-600" 
          borderColor="border-l-blue-500" 
        />
        <StatCard 
          label="Total Wisata Terdaftar" 
          value="42" 
          textColor="text-green-600" 
          borderColor="border-l-green-500" 
        />
        <StatCard 
          label="Tiket Terjual (All Time)" 
          value="1.2k" 
          textColor="text-purple-600" 
          borderColor="border-l-purple-500" 
        />
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
        <p className="text-gray-400 italic">Grafik Pertumbuhan User (Coming Soon)</p>
      </div>
    </div>
  );
}