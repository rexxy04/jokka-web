'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// 1. Import Service & Types
import { getPublicEvents, EventData } from '@/lib/services/event';
import { getFeaturedDestinations, DestinationData } from '@/lib/services/destination';

// 2. Import Components
import EventPortraitCard from '@/components/event/EventPortraitCard';
import DestinationCard from '@/components/destination/DestinationCard';

// Kategori Cepat (Static Menu)
const categories = [
  { name: 'Musik', icon: '🎵' },
  { name: 'Alam', icon: '🏔️' },
  { name: 'Kuliner', icon: '🍜' },
  { name: 'Sejarah', icon: '🏛️' },
  { name: 'Olahraga', icon: '⚽' },
  { name: 'Workshop', icon: '🎨' },
];

export default function HomePage() {
  // State untuk Data Real
  const [events, setEvents] = useState<EventData[]>([]);
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data Gabungan (Parallel Fetching)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Ambil Event & Destinasi secara bersamaan agar lebih cepat
        const [eventsData, placesData] = await Promise.all([
          getPublicEvents(),
          getFeaturedDestinations(4) // Ambil 4 destinasi terbaik
        ]);

        // Filter event: ambil 5 terdekat saja untuk homepage
        setEvents(eventsData.slice(0, 5));
        setDestinations(placesData);

      } catch (error) {
        console.error("Gagal memuat homepage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO SECTION (IMPACTFUL) */}
      <section className="relative h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50"></div>
        </div>

        {/* Content & Search */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
            Jelajahi Serunya <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Jokka.</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Temukan event musik, destinasi wisata, dan kuliner terbaik di sekitarmu hanya dalam satu aplikasi.
          </p>

          <div className="bg-white p-2 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto transform transition-all hover:scale-[1.02]">
            <div className="pl-6 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari konser, pantai, atau museum..." 
              className="w-full px-4 py-3 outline-none text-gray-700 text-lg rounded-full"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition">
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* 2. KATEGORI CEPAT */}
      <section className="container mx-auto px-4 -mt-16 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-wrap justify-between md:justify-center gap-6 md:gap-12">
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/event?cat=${cat.name}`} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:scale-110 transition-all duration-300 shadow-sm">
                {cat.icon}
              </div>
              <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. EVENT TERLARIS (REAL DATA) */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Pilihan 🔥</h2>
            <p className="text-gray-500 text-sm mt-1">Acara paling ramai minggu ini.</p>
          </div>
          <Link href="/event" className="text-blue-600 font-semibold hover:underline text-sm">Lihat Semua</Link>
        </div>

        {loading ? (
          // Skeleton Loading
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3,4].map(i => <div key={i} className="w-[260px] h-[380px] bg-gray-200 rounded-[2rem] animate-pulse shrink-0" />)}
          </div>
        ) : events.length > 0 ? (
          // Data Real
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {events.map((event) => (
              <div key={event.id} className="snap-center shrink-0 w-[260px]">
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
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
            Belum ada event aktif saat ini.
          </div>
        )}
      </section>

      {/* 4. BANNER CTA PARTNER EO */}
      <section className="container mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <div className="relative z-10 text-center md:text-left max-w-xl">
            <span className="bg-blue-500/20 text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-blue-500/30">Untuk Penyelenggara</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Buat Eventmu Sendiri?</h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Bergabunglah dengan ratusan Event Organizer lainnya. Kelola tiket, pantau penjualan, dan promosikan acaramu di Jokka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register-eo" className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                Daftar Partner EO
                </Link>
                <Link href="/login" className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                Masuk EO Panel
                </Link>
            </div>
          </div>
          
          <div className="relative z-10 w-full md:w-1/3 flex justify-center">
             <div className="text-9xl filter drop-shadow-2xl animate-bounce-slow">🚀</div>
          </div>
        </div>
      </section>

      {/* 5. DESTINASI POPULER (REAL DATA) */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Destinasi Populer 🏝️</h2>
            <p className="text-gray-500 text-sm mt-1">Tempat wisata wajib dikunjungi.</p>
          </div>
          <Link href="/destinasi" className="text-blue-600 font-semibold hover:underline text-sm">Lihat Semua</Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}
           </div>
        ) : destinations.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((place) => (
                <DestinationCard 
                  key={place.id}
                  id={place.id}
                  title={place.name}
                  category={place.category}
                  rating={place.rating}
                  location={place.location}
                  image={place.image}
                />
              ))}
           </div>
        ) : (
           <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
              Belum ada data destinasi.
           </div>
        )}
      </section>

      {/* CSS Tambahan */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>

    </main>
  );
}