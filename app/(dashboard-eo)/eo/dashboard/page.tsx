'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getEOStats } from '@/lib/services/eo';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export default function EODashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    pendingEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Fetch Statistik
        const data = await getEOStats(user.uid);
        setStats(data);

        // 2. Fetch Recent Events (Untuk Tabel Bawah)
        const qEvents = query(
            collection(db, "events"), 
            where("organizerId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(3)
        );
        const eventsSnap = await getDocs(qEvents);
        const recents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentEvents(recents);

        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Berikut adalah performa penjualan tiket Anda.</p>
        </div>
        
        {/* Tombol Buat Event Baru (Ungu Neon) */}
        <Link 
            href="/eo/my-events/create" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
        >
            <span>+</span> Buat Event Baru
        </Link>
      </div>
      
      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Event */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    📅
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Event</p>
            <h3 className="text-3xl font-bold text-white">{loading ? "-" : stats.totalEvents}</h3>
        </div>

        {/* Card 2: Tiket Terjual */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                    🎟️
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Tiket Terjual</p>
            <h3 className="text-3xl font-bold text-white">{loading ? "-" : stats.ticketsSold}</h3>
        </div>

        {/* Card 3: Pendapatan */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group md:col-span-1 lg:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    💰
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Estimasi Pendapatan</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{loading ? "-" : formatRupiah(stats.totalRevenue)}</h3>
        </div>

        {/* Card 4: Menunggu Approval */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                    ⏳
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Menunggu Approval</p>
            <h3 className="text-3xl font-bold text-white">{loading ? "-" : stats.pendingEvents}</h3>
        </div>

      </div>

      {/* --- GRAFIK PLACEHOLDER --- */}
      <div className="bg-[#151923] rounded-3xl border border-gray-800/50 h-80 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Hiasan Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
        
        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 text-2xl">
            📊
        </div>
        <h3 className="text-white font-bold text-lg">Grafik Penjualan Bulanan</h3>
        <p className="text-gray-500 text-sm mt-2">Data visual akan tersedia di sini (Coming Soon)</p>
      </div>

      {/* --- TABEL AKTIVITAS TERBARU --- */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Aktivitas Terbaru</h3>
        <div className="bg-[#151923] rounded-2xl border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#1A1F2E] text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Harga Mulai</th>
                            <th className="px-6 py-4 text-right">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Memuat...</td></tr>
                        ) : recentEvents.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada event.</td></tr>
                        ) : (
                            recentEvents.map((evt) => (
                                <tr key={evt.id} className="hover:bg-[#1E2230] transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden">
                                                <img src={evt.poster} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm line-clamp-1">{evt.title}</p>
                                                <p className="text-gray-500 text-xs">{evt.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {evt.status === 'published' ? (
                                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                                Tayang
                                            </span>
                                        ) : evt.status === 'pending_review' ? (
                                            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                                Review
                                            </span>
                                        ) : (
                                            <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300 font-mono text-sm">
                                        {evt.tickets?.[0] ? formatRupiah(evt.tickets[0].price) : "Gratis"}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-sm">
                                        {new Date(evt.startDate).toLocaleDateString('id-ID')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

    </div>
  );
}