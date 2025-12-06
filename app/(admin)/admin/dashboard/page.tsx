'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard'; 
import { getAdminStats } from '@/lib/services/admin'; // Import Service

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingEO: 0,
    activeEO: 0,
    totalPlaces: 0,
    totalTicketsSold: 0
  });

  useEffect(() => {
    async function fetchData() {
      const data = await getAdminStats();
      setStats(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          {loading ? "Sedang menghitung data..." : "Pantau aktivitas platform Jokka secara keseluruhan."}
        </p>
      </div>

      {/* Grid Statistik Real-time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="EO Menunggu Verifikasi" 
          value={stats.pendingEO.toString()} 
          textColor="text-orange-600" 
          borderColor="border-l-orange-500" 
        />
        <StatCard 
          label="Total Partner EO" 
          value={stats.activeEO.toString()} 
          textColor="text-blue-600" 
          borderColor="border-l-blue-500" 
        />
        <StatCard 
          label="Total Wisata Terdaftar" 
          value={stats.totalPlaces.toString()} 
          textColor="text-green-600" 
          borderColor="border-l-green-500" 
        />
        <StatCard 
          label="Tiket Terjual (All Time)" 
          value={stats.totalTicketsSold.toString()} 
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