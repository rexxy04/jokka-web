'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEventsByMonth } from '@/lib/services/event';

// List Nama Bulan
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();
  // Default bulan aktif = bulan sekarang
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data setiap kali activeMonthIndex berubah
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getEventsByMonth(activeMonthIndex, currentYear);
      setEvents(data);
      setLoading(false);
    }
    fetchData();
  }, [activeMonthIndex, currentYear]);

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Kalender Event {currentYear} 🗓️</h1>
          <p className="text-gray-500 mt-2">Temukan keseruan di setiap bulannya.</p>
        </div>

        {/* --- CAROUSEL BULAN (Sticky) --- */}
        <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md py-4 border-y border-gray-200 mb-8 shadow-sm">
          <div className="flex overflow-x-auto gap-3 px-4 pb-2 snap-x no-scrollbar">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                onClick={() => setActiveMonthIndex(index)}
                className={`snap-center shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeMonthIndex === index
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* --- LIST EVENT --- */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Sedang memuat jadwal...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">Belum ada event terjadwal di bulan {MONTHS[activeMonthIndex]} 🍂</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              // Event Card Horizontal (Model Tiket)
              <Link 
                href={`/event/${evt.id}`} 
                key={evt.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-row h-40"
              >
                {/* Tanggal (Kiri) */}
                <div className="w-24 bg-blue-50 flex flex-col items-center justify-center text-blue-600 border-r border-blue-100 p-2 text-center">
                  <span className="text-xs font-bold uppercase">{new Date(evt.startDate).toLocaleString('id-ID', { month: 'short' })}</span>
                  <span className="text-3xl font-extrabold">{new Date(evt.startDate).getDate()}</span>
                  <span className="text-xs">{new Date(evt.startDate).toLocaleString('id-ID', { weekday: 'short' })}</span>
                </div>

                {/* Konten (Kanan) */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{evt.category}</span>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      📍 {evt.locationName || "Lokasi Event"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Lihat Detail &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}