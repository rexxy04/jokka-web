'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StatCard from '@/components/ui/StatCard';
import { getEOStats } from '@/lib/services/eo';

export default function EODashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    pendingEvents: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch Statistik Real
        const data = await getEOStats(user.uid);
        setStats(data);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">
          {loading ? "Memuat data..." : "Berikut adalah performa penjualan tiket Anda."}
        </p>
      </div>
      
      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Event" 
          value={stats.totalEvents.toString()} 
          textColor="text-indigo-600" 
          borderColor="border-l-indigo-500" 
        />
        <StatCard 
          label="Tiket Terjual" 
          value={stats.ticketsSold.toString()} 
          textColor="text-green-600" 
          borderColor="border-l-green-500" 
        />
        <StatCard 
          label="Estimasi Pendapatan" 
          value={formatRupiah(stats.totalRevenue)} 
          textColor="text-blue-600" 
          borderColor="border-l-blue-500" 
        />
        <StatCard 
          label="Menunggu Approval" 
          value={stats.pendingEvents.toString()} 
          textColor="text-orange-500" 
          borderColor="border-l-orange-400" 
        />
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
        <p className="text-gray-400 italic">Grafik Penjualan Bulanan (Coming Soon)</p>
      </div>
    </div>
  );
}