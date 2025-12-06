'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StatCard from '@/components/ui/StatCard';
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
        
        // Hitung Total Pendapatan
        const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setTotalRevenue(total);
        
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Format Rupiah
  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  
  // Format Tanggal
  const formatDate = (timestamp: any) => {
    // Handle format timestamp firestore atau string date
    if (!timestamp) return "-";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan 💰</h1>
        <p className="text-gray-500 mt-1">Rekapitulasi transaksi tiket event Anda yang berhasil.</p>
      </div>

      {/* RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          label="Total Transaksi Sukses" 
          value={sales.length.toString()} 
          textColor="text-green-600" 
          borderColor="border-l-green-500"
        />
        <StatCard 
          label="Total Pendapatan Masuk" 
          value={formatPrice(totalRevenue)} 
          textColor="text-blue-600" 
          borderColor="border-l-blue-500"
        />
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Riwayat Transaksi Terbaru</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli (User ID)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Memuat data penjualan...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada penjualan tiket. Promosikan event Anda!
                  </td>
                </tr>
              ) : (
                sales.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.createdAt || item.transactionTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{item.eventName}</span>
                      <div className="text-xs text-gray-400">ORDER ID: {item.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {/* Kita cuma simpan userId di transaksi, kalau mau nama harus fetch user lagi. */}
                      {/* Untuk MVP, tampilkan ID atau 'Guest' */}
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{item.userId.substring(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.paymentType?.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
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