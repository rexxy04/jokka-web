'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// 1. Import Service
import { getPublicEvents, EventData } from '@/lib/services/event';
import { getFeaturedDestinations, DestinationData } from '@/lib/services/destination';

// 2. Import Components
import HeroSection from '@/components/public/HeroSection'; // <--- Import Hero Baru
import EventPortraitCard from '@/components/event/EventPortraitCard';
import DestinationCard from '@/components/destination/DestinationCard';

// Kategori Cepat
const categories = [
  { name: 'Musik', icon: '🎵', path: '/event' },
  { name: 'Alam', icon: '🏔️', path: '/destinasi' },
  { name: 'Kuliner', icon: '🍜', path: '/destinasi' },
  { name: 'Sejarah', icon: '🏛️', path: '/destinasi' },
  { name: 'Olahraga', icon: '⚽', path: '/event' },
  { name: 'Workshop', icon: '🎨', path: '/event' }, 
];

export default function HomePage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [eventsData, placesData] = await Promise.all([
          getPublicEvents(),
          getFeaturedDestinations(4)
        ]);
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
      
      {/* 1. HERO SECTION (REFACTORED) */}
      <HeroSection />

      {/* 2. KATEGORI CEPAT */}
      <section className="container mx-auto px-4 -mt-16 relative z-20 mb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-wrap justify-between md:justify-center gap-6 md:gap-12">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.path} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:scale-110 transition-all duration-300 shadow-sm">
                {cat.icon}
              </div>
              <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. EVENT TERLARIS */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Pilihan 🔥</h2>
            <p className="text-gray-500 text-sm mt-1">Acara paling ramai minggu ini.</p>
          </div>
          <Link href="/event" className="text-blue-600 font-semibold hover:underline text-sm">Lihat Semua</Link>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3,4].map(i => <div key={i} className="w-[260px] h-[380px] bg-gray-200 rounded-[2rem] animate-pulse shrink-0" />)}
          </div>
        ) : events.length > 0 ? (
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

      {/* 5. DESTINASI POPULER */}
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

      {/* CSS Animasi */}
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