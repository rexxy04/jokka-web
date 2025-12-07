'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Tayang</span>;
      case 'pending_review':
        return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Review</span>;
      case 'rejected':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Ditolak</span>;
      default:
        return <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Event Saya</h1>
          <p className="text-gray-400 text-sm">Kelola semua event yang Anda selenggarakan.</p>
        </div>
        <div>
          <Link 
            href="/eo/my-events/create" 
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
          >
            <span>+</span> Buat Event Baru
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-[#151923] rounded-2xl border border-gray-800/50 animate-pulse">
          <p>Sedang memuat data event...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#151923] p-12 rounded-2xl border border-gray-800/50 text-center shadow-lg">
          <div className="text-6xl mb-4 opacity-50">🎫</div>
          <h3 className="text-xl font-bold text-white">Belum ada Event</h3>
          <p className="text-gray-400 mb-6 mt-2 text-sm">Mulai buat event pertamamu dan raih audiens!</p>
          <Link href="/eo/my-events/create" className="text-indigo-400 hover:text-indigo-300 font-medium underline">
            Buat Event Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-[#151923] rounded-2xl border border-gray-800/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1A1F2E] text-gray-400 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Tanggal & Lokasi</th>
                  <th className="px-6 py-4">Tiket</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-[#1E2230] transition duration-200">
                    
                    {/* Kolom 1: Event */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-700 border border-gray-600">
                          <img className="h-full w-full object-cover" src={event.poster} alt="" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white line-clamp-1 mb-1">{event.title}</div>
                          <div className="text-xs text-indigo-400 font-medium uppercase tracking-wide">{event.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Tanggal */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{new Date(event.startDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">{event.locationName}</div>
                    </td>

                    {/* Kolom 3: Tiket */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-mono">
                        {event.tickets && event.tickets[0] ? formatPrice(event.tickets[0].price) : "Gratis"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Terjual: <span className="text-green-400 font-bold">{event.tickets?.[0]?.sold || 0}</span> / {event.tickets?.[0]?.stock}
                      </div>
                    </td>

                    {/* Kolom 4: Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(event.status)}
                    </td>

                    {/* Kolom 5: Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link 
                        href={`/event/${event.id}`} 
                        target="_blank"
                        className="text-indigo-400 hover:text-white font-medium text-sm transition hover:underline"
                      >
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