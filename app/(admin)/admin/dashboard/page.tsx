'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats } from '@/lib/services/admin';
// Import Library Grafik (Pastikan sudah npm install recharts)
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Data Dummy untuk Grafik
const chartData = [
  { name: 'Minggu 1', users: 45 },
  { name: 'Minggu 2', users: 80 },
  { name: 'Minggu 3', users: 150 },
  { name: 'Minggu 4', users: 230 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingEO: 0,
    activeEO: 0,
    totalPlaces: 0,
    totalTicketsSold: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Menggunakan Service yang sudah ada
      const data = await getAdminStats();
      setStats(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Dashboard Admin</h1>
        <p className="text-gray-500 text-lg">Pantau aktivitas platform Jokka secara keseluruhan.</p>
      </div>

      {/* --- STAT CARDS (MODERN STYLE) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Kuning */}
        <StatCard 
          title="EO Menunggu Verifikasi" 
          value={stats.pendingEO} 
          loading={loading}
          icon="⏳"
          theme="yellow"
        />
        
        {/* Card 2: Biru */}
        <StatCard 
          title="Total Partner EO" 
          value={stats.activeEO} 
          loading={loading}
          icon="🤝"
          theme="blue"
        />

        {/* Card 3: Hijau */}
        <StatCard 
          title="Total Wisata Terdaftar" 
          value={stats.totalPlaces} 
          loading={loading}
          icon="🗺️"
          theme="green"
        />

        {/* Card 4: Ungu (Dengan Link ke Ticket Sales) */}
        <Link href="/admin/ticket-sales" className="block transition-transform hover:scale-105">
          <StatCard 
            title="Tiket Terjual (All Time)" 
            value={stats.totalTicketsSold} 
            loading={loading}
            icon="🎟️"
            theme="purple"
            verifiedIcon // Ikon centang biru kecil
          />
        </Link>
      </div>

      {/* --- GRAFIK AREA CHART (RECHARTS) --- */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-white">
        <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Grafik Pertumbuhan User</h3>
            <p className="text-gray-500 mt-1">Data pertumbuhan pengguna baru dalam satu bulan terakhir.</p>
        </div>
        
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorPv)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

// --- KOMPONEN LOKAL STAT CARD (CUSTOM DESIGN) ---
interface StatCardProps {
    title: string;
    value: number | string;
    loading: boolean;
    icon: string;
    theme: 'yellow' | 'blue' | 'green' | 'purple';
    verifiedIcon?: boolean;
}

const StatCard = ({ title, value, loading, icon, theme, verifiedIcon }: StatCardProps) => {
    // Mapping warna berdasarkan tema
    const themeColors = {
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', iconBg: 'bg-yellow-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
        green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    };
    const colors = themeColors[theme];

    return (
        <div className={`p-6 rounded-[2rem] border border-white shadow-sm backdrop-blur-sm ${colors.bg} flex flex-col justify-between h-40 relative overflow-hidden transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${colors.text} flex items-center gap-2`}>
                    {title}
                    {verifiedIcon && <span className="bg-blue-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px]">✓</span>}
                </h3>
                <div className={`w-12 h-12 rounded-2xl ${colors.iconBg} flex items-center justify-center text-2xl shadow-inner`}>
                    {icon}
                </div>
            </div>
            <div>
                {loading ? (
                    <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : (
                    <p className={`text-5xl font-extrabold ${colors.text}`}>{value}</p>
                )}
            </div>
        </div>
    );
};