'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Button from '@/components/ui/Button';
// Import Service
import { getMyEvents } from '@/lib/services/eo';

export default function MyEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getMyEvents(user.uid);
        setEvents(data);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Helper untuk Warna Status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Tayang</span>;
      case 'pending_review':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">Menunggu Review</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Ditolak</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Draft</span>;
    }
  };

  // Helper Format Rupiah
  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Saya 📅</h1>
          <p className="text-gray-500 mt-1">Kelola semua event yang Anda selenggarakan.</p>
        </div>
        <div>
          <Button href="/eo/my-events/create" variant="primary" className="shadow-lg hover:shadow-indigo-500/30">
            + Buat Event Baru
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          <p>Sedang memuat data event...</p>
        </div>
      ) : events.length === 0 ? (
        // STATE KOSONG
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-lg font-bold text-gray-900">Belum ada Event</h3>
          <p className="text-gray-500 mb-6">Anda belum membuat event apapun. Mulai buat sekarang!</p>
          <Button href="/eo/my-events/create" variant="outline">
            Buat Event Pertama
          </Button>
        </div>
      ) : (
        // TABEL DATA
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal & Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition">
                    
                    {/* Kolom 1: Gambar & Judul */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img className="h-12 w-12 object-cover" src={event.poster} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 line-clamp-1">{event.title}</div>
                          <div className="text-xs text-gray-500">{event.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Tanggal */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(event.startDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-gray-500">{event.locationName}</div>
                    </td>

                    {/* Kolom 3: Tiket */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.tickets && event.tickets[0] ? formatPrice(event.tickets[0].price) : "Gratis"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Terjual: <span className="font-bold text-indigo-600">{event.tickets?.[0]?.sold || 0}</span> / {event.tickets?.[0]?.stock}
                      </div>
                    </td>

                    {/* Kolom 4: Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(event.status)}
                    </td>

                    {/* Kolom 5: Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/event/${event.id}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}