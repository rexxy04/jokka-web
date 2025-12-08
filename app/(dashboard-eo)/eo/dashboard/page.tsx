'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

// 1. Import Service
import { getEOStats, getEOSalesReport } from '@/lib/services/eo'; // <-- Tambah getEOSalesReport
import { getEOSalesStats } from '@/lib/services/transaction';     // Masih dipakai untuk Grafik
import SalesChart from '@/components/eo/SalesChart';

export default function EODashboard() {
  const [loading, setLoading] = useState(true);
  
  // State Statistik
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    pendingEvents: 0
  });
  
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            // --- A. FETCH STATISTIK EVENT (Total & Pending) ---
            // Menggunakan logic manual merge agar akurat
            const qNew = query(collection(db, "events"), where("eoId", "==", user.uid));
            const qLegacy = query(collection(db, "events"), where("organizerId", "==", user.uid));

            const [snapNew, snapLegacy] = await Promise.all([getDocs(qNew), getDocs(qLegacy)]);

            // Gabungkan hasil
            const eventsMap = new Map();
            snapLegacy.docs.forEach(doc => eventsMap.set(doc.id, doc.data()));
            snapNew.docs.forEach(doc => eventsMap.set(doc.id, doc.data()));

            const allEvents = Array.from(eventsMap.values());

            const totalEvents = allEvents.length;
            const pendingEvents = allEvents.filter((e: any) => e.status === 'pending' || e.status === 'pending_review').length;


            // --- B. FETCH DATA TRANSAKSI UTAMA (Untuk Angka Card) ---
            // Kita gunakan getEOSalesReport karena ini yang terbukti benar di page Sales
            const rawSalesReport = await getEOSalesReport(user.uid);
            
            // Hitung Total Uang
            const realRevenue = rawSalesReport.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
            
            // Hitung Total Tiket (Handle jika ada field qty, default 1)
            const realTicketsSold = rawSalesReport.reduce((acc: number, curr: any) => acc + (Number(curr.qty) || 1), 0);


            // --- C. FETCH DATA GRAFIK (Untuk Visualisasi Bar Chart) ---
            const chartStats = await getEOSalesStats(user.uid);
            setChartData(chartStats);


            // --- D. SET STATE DASHBOARD ---
            setStats({
                totalEvents,
                pendingEvents,
                ticketsSold: realTicketsSold, // <-- Pakai data dari Sales Report
                totalRevenue: realRevenue     // <-- Pakai data dari Sales Report
            });


            // --- E. FETCH RECENT EVENTS (Tabel Bawah) ---
            const sortedRecent = Array.from(eventsMap.entries())
                .map(([id, data]) => ({ id, ...(data as any) }))
                .sort((a: any, b: any) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA; // Descending
                })
                .slice(0, 3);

            setRecentEvents(sortedRecent);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'approved':
        return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Tayang</span>;
      case 'pending_review':
      case 'pending':
        return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Review</span>;
      case 'rejected':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Ditolak</span>;
      default:
        return <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Draft</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Berikut adalah performa penjualan tiket Anda.</p>
        </div>
        <Link 
            href="/eo/my-events/create" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
        >
            <span>+</span> Buat Event Baru
        </Link>
      </div>
      
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Event */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">📅</div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Event</p>
            <h3 className="text-3xl font-bold text-white">{loading ? "-" : stats.totalEvents}</h3>
        </div>

        {/* Tiket Terjual */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">🎟️</div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Tiket Terjual</p>
            <h3 className="text-3xl font-bold text-white">{loading ? "-" : stats.ticketsSold}</h3>
        </div>

        {/* Estimasi Pendapatan */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">💰</div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Estimasi Pendapatan</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{loading ? "-" : formatRupiah(stats.totalRevenue)}</h3>
        </div>

        {/* Menunggu Approval */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">⏳</div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">Menunggu Approval</p>
            <h3 className="text-3xl font-bold text-white">{loading ? "-" : stats.pendingEvents}</h3>
        </div>
      </div>

      {/* GRAFIK PENJUALAN */}
      <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
           <h3 className="text-lg font-bold text-white">Grafik Penjualan Bulanan</h3>
           <div className="bg-[#1E2230] p-1 rounded-lg flex text-xs">
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-md">2025</span>
           </div>
        </div>
        <p className="text-gray-500 text-xs mb-6">Visualisasi pendapatan tiket bersih.</p>
        
        {loading ? (
           <div className="h-[300px] w-full flex items-center justify-center text-gray-500 animate-pulse">Memuat Data Grafik...</div>
        ) : (
           <SalesChart data={chartData} />
        )}
      </div>

      {/* TABEL AKTIVITAS TERBARU */}
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
                                                <img 
                                                    src={evt.posterUrl || evt.poster || '/placeholder-event.jpg'} 
                                                    alt="" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm line-clamp-1">{evt.title}</p>
                                                <p className="text-gray-500 text-xs">{evt.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(evt.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300 font-mono text-sm">
                                        {evt.tickets?.[0] ? formatRupiah(evt.tickets[0].price) : "Gratis"}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-sm">
                                        {evt.startDate ? new Date(evt.startDate).toLocaleDateString('id-ID') : '-'}
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