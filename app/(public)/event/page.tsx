'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/card';
import { getPublishedEvents } from '@/lib/services/event';

export default function EventPage() {
  const [currentMonthEvents, setCurrentMonthEvents] = useState<any[]>([]);
  const [randomEvents, setRandomEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const allEvents = await getPublishedEvents();
      const now = new Date();

      // 1. Filter Event Bulan Ini
      const thisMonth = allEvents.filter(e => {
        const d = new Date(e.startDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      // 2. Random Event (Sisanya / Semua diacak)
      // Algoritma ngacak sederhana
      const shuffled = [...allEvents].sort(() => 0.5 - Math.random());

      setCurrentMonthEvents(thisMonth);
      setRandomEvents(shuffled);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      
      {/* SECTION 1: HIGHLIGHT BULAN INI */}
      <section className="bg-indigo-900 pt-28 pb-12 px-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Event Bulan Ini 🔥</h1>
          <p className="text-indigo-200 mb-8">Jangan lewatkan keseruan di bulan {new Date().toLocaleString('id-ID', { month: 'long' })}.</p>

          {loading ? (
            <p>Memuat...</p>
          ) : currentMonthEvents.length > 0 ? (
            // Tampilan Poster Horizontal Scroll
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
              {currentMonthEvents.map((evt) => (
                <div key={evt.id} className="snap-center shrink-0 w-[300px] relative rounded-xl overflow-hidden shadow-lg border border-indigo-700 group cursor-pointer">
                  <Link href={`/event/${evt.id}`}>
                    <div className="h-[400px] w-full">
                      <img src={evt.poster} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
                      <h3 className="font-bold text-lg truncate">{evt.title}</h3>
                      <p className="text-yellow-400 text-sm">📅 {new Date(evt.startDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-indigo-300 italic">Belum ada event khusus bulan ini.</p>
          )}
        </div>
      </section>

      {/* SECTION 2: RANDOM EVENTS */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Jelajahi Semua Event 🎫</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {randomEvents.map((evt) => (
            <Card
              key={evt.id}
              title={evt.title}
              category={evt.category}
              image={evt.poster}
              href={`/event/${evt.id}`}
            />
          ))}
        </div>
      </section>

      {/* FLOATING BUTTON */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <Link 
          href="/kalender-event"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-2xl transition hover:scale-105 font-bold"
        >
          📅 Lihat Kalender Event
        </Link>
      </div>

    </main>
  );
}