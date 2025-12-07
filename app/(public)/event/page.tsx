'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; 
import EventPortraitCard from '@/components/event/EventPortraitCard';
import EventLandscapeCard from '@/components/event/EventLandscapeCard';
import { getPublicEvents, EventData } from '@/lib/services/event';

export default function EventPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter Kategori
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const categories = ['Semua', 'Musik', 'Festival', 'Workshop', 'Pameran', 'Olahraga', 'Kuliner'];

  // Fetch Data dari Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPublicEvents();
        setEvents(data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper Format Tanggal (Contoh: 25 Des 2025)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // --- LOGIC 1: HERO SECTION (EVENT BULAN INI / MENDATANG) ---
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); 
  const currentYear = currentDate.getFullYear();

  // 1. Coba cari event khusus bulan ini
  const thisMonthEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  });

  // 2. Tentukan Data Hero:
  // Jika bulan ini kosong, ambil 4 event teratas dari semua data (Next Upcoming)
  let featuredEvents = thisMonthEvents;
  let isFallback = false; // Penanda apakah kita pakai data fallback atau tidak

  if (thisMonthEvents.length === 0 && events.length > 0) {
      featuredEvents = events.slice(0, 4);
      isFallback = true;
  }

  // --- LOGIC 2: FILTER KATEGORI (LIST BAWAH) ---
  const filteredEvents = selectedCategory === 'Semua' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-blue-400 rounded-full mb-2 animate-bounce"></div>
          <p className="font-medium">Memuat Event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-[#6366f1] via-[#3b82f6] to-[#2dd4bf] pt-32 pb-24 px-4 rounded-b-[3rem] shadow-xl shadow-blue-200/50 min-h-[500px]">
        <div className="container mx-auto">
          
          <div className="text-center mb-10 text-white">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-sm">
                {/* Judul berubah dinamis agar tidak aneh jika kosong */}
                {isFallback ? "Event Mendatang 🔥" : "Event Bulan Ini 🔥"}
            </h1>
            <p className="text-blue-50 text-sm md:text-base font-medium opacity-90">
               {isFallback 
                 ? "Temukan berbagai event seru yang akan segera hadir!" 
                 : `Jangan lewatkan keseruan di bulan ${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(currentDate)}.`
               }
            </p>
          </div>

          {/* Card Carousel */}
          {featuredEvents.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide justify-center">
              {featuredEvents.map((event) => (
                <div key={event.id} className="snap-center shrink-0 w-[260px] md:w-auto">
                  <EventPortraitCard 
                    id={event.id}
                    title={event.title} 
                    date={formatDate(event.startDate)}
                    image={event.posterUrl || event.poster || '/placeholder-event.jpg'} 
                  />
                </div>
              ))}
            </div>
          ) : (
             /* Tampilan jika DATABASE KOSONG melompong (status published 0) */
             <div className="flex flex-col items-center justify-center text-center text-white/90 py-12 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 max-w-2xl mx-auto">
                <span className="text-4xl mb-2">😴</span>
                <h3 className="text-xl font-bold">Belum ada event aktif</h3>
                <p className="text-sm opacity-80 mt-1">Pastikan event sudah dibuat dan disetujui oleh Admin.</p>
             </div>
          )}

        </div>
      </section>


      {/* --- LIST SECTION (Jelajahi Semua Event) --- */}
      {/* Jarak mt-12 agar tidak menabrak hero section */}
      <section className="container mx-auto px-4 mt-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          
          {/* Judul Bagian Bawah */}
          <div>
             <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               Jelajahi Semua Event 🎫
             </h2>
             <p className="text-gray-500 text-sm mt-1">Temukan aktivitas seru sesuai hobimu.</p>
          </div>

          {/* Tombol Kalender */}
          <Link href="/kalender-event">
            <button className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lihat Kalender Event
            </button>
          </Link>
        </div>

        {/* --- FILTER KATEGORI --- */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- GRID EVENT LIST --- */}
        {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
                <EventLandscapeCard 
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    location={event.locationName} 
                    category={event.category}
                    image={event.posterUrl || event.poster || '/placeholder-event.jpg'}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 mb-2">Tidak ada event ditemukan untuk kategori ini.</p>
                <button 
                  onClick={() => setSelectedCategory('Semua')}
                  className="text-blue-600 font-bold hover:underline text-sm"
                >
                  Tampilkan Semua
                </button>
            </div>
        )}

      </section>

    </div>
  );
}