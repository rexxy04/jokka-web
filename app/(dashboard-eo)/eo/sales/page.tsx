'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getEOSalesReport } from '@/lib/services/eo';

export default function SalesReportPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getEOSalesReport(user.uid);
        setSales(data);
        const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setTotalRevenue(total);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Laporan Penjualan</h1>
        <p className="text-gray-400 text-sm">Rekapitulasi transaksi tiket event Anda yang berhasil.</p>
      </div>

      {/* RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">✓</div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Transaksi Sukses</p>
                <h3 className="text-4xl font-bold text-green-400">{loading ? "-" : sales.length}</h3>
            </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#151923] p-6 rounded-2xl border border-gray-800/50 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-50 group-hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">💰</div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Pendapatan Masuk</p>
                <h3 className="text-4xl font-bold text-purple-400 tracking-tight">{loading ? "-" : formatPrice(totalRevenue)}</h3>
            </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-[#151923] rounded-2xl border border-gray-800/50 overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-gray-800/50">
          <h3 className="font-bold text-white text-lg">Riwayat Transaksi Terbaru</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1A1F2E] text-gray-400 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Pembeli (User ID)</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Memuat data...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Belum ada penjualan tiket.</td></tr>
              ) : (
                sales.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1E2230] transition duration-200">
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {formatDate(item.createdAt || item.transactionTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white block mb-1">{item.eventName}</span>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">ID: {item.orderId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#1A1F2E] text-gray-300 px-2 py-1 rounded text-xs font-mono border border-gray-700">
                        {item.userId.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {item.paymentType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-400 font-mono">
                      {formatPrice(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}