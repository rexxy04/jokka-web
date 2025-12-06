'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSalesAnalysis } from '@/lib/services/admin';

export default function GlobalTicketSalesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAllSold, setTotalAllSold] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const result = await getSalesAnalysis();
      setData(result);
      
      // Hitung total global untuk header
      const sum = result.reduce((acc, curr) => acc + curr.sold, 0);
      setTotalAllSold(sum);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">&larr; Kembali</Link>
        <h1 className="text-2xl font-bold text-gray-900">Analisis Penjualan Tiket 🎫</h1>
      </div>

      {/* BIG CARD */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white shadow-lg">
        <p className="text-purple-100 text-lg mb-1">Total Tiket Terjual (All Time)</p>
        <h2 className="text-5xl font-bold">{loading ? "..." : totalAllSold} <span className="text-2xl font-normal opacity-80">Tiket</span></h2>
      </div>

      {/* BREAKDOWN TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700">Performa Penjualan per Event Organizer</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama EO</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Event</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tiket Terjual</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Estimasi Omzet</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Menghitung data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data penjualan.</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{item.eventCount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      {item.sold}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600 font-mono">
                    {formatRupiah(item.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}