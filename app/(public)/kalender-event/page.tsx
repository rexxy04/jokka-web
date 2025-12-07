'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getEventsByMonth } from '@/lib/services/event';

// List Nama Bulan
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function CalendarPage() {
  const currentYear = new Date().getFullYear();
  
  // --- STATE ---
  // Kita mulai dari index 12 (Januari di set kedua) agar ada ruang scroll kiri/kanan
  const INITIAL_INDEX = (12) + new Date().getMonth();
  
  const [activeAbsoluteIndex, setActiveAbsoluteIndex] = useState(INITIAL_INDEX);
  const [selectedYear, setSelectedYear] = useState(currentYear); // State Tahun Baru
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Generate Opsi Tahun (Misal: 2 tahun lalu s/d 2 tahun ke depan)
  const yearOptions = Array.from({length: 5}, (_, i) => currentYear - 2 + i);

  // Render 3 set bulan untuk efek infinite loop
  const infiniteMonths = [...MONTHS, ...MONTHS, ...MONTHS]; 

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 1. Fetch Data (Update: Dependensi ke selectedYear)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const realMonthIndex = activeAbsoluteIndex % 12;
      // Fetch berdasarkan Bulan DAN Tahun yang dipilih
      const data = await getEventsByMonth(realMonthIndex, selectedYear);
      setEvents(data);
      setLoading(false);
    }
    fetchData();
  }, [activeAbsoluteIndex, selectedYear]);

  // 2. Logic Scroll Presisi ke Tengah
  const scrollToCenter = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;
    const card = cardRefs.current[index];

    if (container && card) {
      const scrollLeft = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: behavior
      });
    }
  };

  // 3. Initial Load
  useEffect(() => {
    setTimeout(() => {
      scrollToCenter(activeAbsoluteIndex, 'auto');
    }, 100);
  }, []);

  const handleMonthClick = (index: number) => {
    setActiveAbsoluteIndex(index);
    scrollToCenter(index, 'smooth');

    const realIndex = index % 12;
    if (index < 12 || index >= 24) {
      setTimeout(() => {
        const targetCenterIndex = realIndex + 12;
        setActiveAbsoluteIndex(targetCenterIndex);
        scrollToCenter(targetCenterIndex, 'auto');
      }, 500);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-12 overflow-x-hidden">
      <div className="container mx-auto px-4">
        
        {/* --- HEADER SECTION --- */}
        <div className="relative mb-10 flex flex-col md:block items-center">
          
          {/* DROPDOWN TAHUN (Posisi Kanan Atas di Desktop) */}
          <div className="md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 z-20 mb-4 md:mb-0">
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="appearance-none bg-white border border-gray-200 text-gray-800 font-bold py-2 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 transition"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>Tahun {year}</option>
                ))}
              </select>
              {/* Custom Chevron Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* JUDUL TENGAH */}
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Event di Bulan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {MONTHS[activeAbsoluteIndex % 12]}
              </span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg font-medium tracking-wide uppercase">
              MAKASSAR {selectedYear}
            </p>
          </div>
        </div>

        {/* --- 3D CAROUSEL CONTAINER --- */}
        <div className="relative w-full mb-12 h-80 flex items-center justify-center">
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-4 overflow-x-auto py-10 px-4 w-full no-scrollbar"
            style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
          >
            <div className="shrink-0 w-[50vw]" />

            {infiniteMonths.map((month, idx) => {
              const isActive = activeAbsoluteIndex === idx;
              const distance = Math.abs(activeAbsoluteIndex - idx);
              
              let scaleClass = 'scale-75 opacity-40 z-0 grayscale blur-[1px]'; 
              if (isActive) scaleClass = 'scale-110 opacity-100 z-20 shadow-2xl'; 
              else if (distance === 1) scaleClass = 'scale-90 opacity-80 z-10'; 
              else if (distance === 2) scaleClass = 'scale-75 opacity-60 z-0'; 

              const isFar = distance > 5;

              return (
                <button
                  key={`${month}-${idx}`}
                  // @ts-ignore
                  ref={el => cardRefs.current[idx] = el}
                  onClick={() => handleMonthClick(idx)}
                  className={`
                    shrink-0 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 ease-out relative overflow-hidden group w-36 h-48 bg-white border border-gray-100 scroll-snap-align-center
                    ${scaleClass}
                    ${isActive ? 'bg-blue-600 border-blue-600' : 'hover:bg-gray-50'}
                    ${isFar ? 'invisible' : 'visible'} 
                  `}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {isActive && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/30 rounded-full -ml-10 -mb-10 blur-xl"></div>
                    </>
                  )}
                  <span className={`text-4xl font-black tracking-tighter ${isActive ? 'text-blue-200/50' : 'text-gray-300'}`}>
                    {(idx % 12) + 1 < 10 ? `0${(idx % 12) + 1}` : (idx % 12) + 1}
                  </span>
                  <span className={`text-lg font-bold mt-2 uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {month.substring(0, 3)}
                  </span>
                  <span className={`text-xs font-medium mt-1 ${isActive ? 'text-blue-100' : 'hidden'}`}>
                    {month}
                  </span>
                </button>
              );
            })}
            <div className="shrink-0 w-[50vw]" />
          </div>
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-30" />
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-30" />
        </div>

        {/* --- LIST EVENT --- */}
        <div className="max-w-5xl mx-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Sedang mencari event tahun {selectedYear}...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 px-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 animate-fadeIn">
                  <div className="text-5xl mb-4">🍃</div>
                  <h3 className="text-xl font-bold text-gray-800">Sepi nih...</h3>
                  <p className="text-gray-500 mt-2">
                    Belum ada event terjadwal di <span className="font-bold text-blue-600">{MONTHS[activeAbsoluteIndex % 12]} {selectedYear}</span>.
                  </p>
                  <Button href="/event" variant="outline" className="mt-6">Cek Semua Event</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {events.map((evt) => (
                  <Link href={`/event/${evt.id}`} key={evt.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-row h-48">
                      <div className="w-28 bg-blue-50 flex flex-col items-center justify-center text-blue-600 border-r border-blue-100 p-2 text-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 relative overflow-hidden">
                          <span className="text-xs font-bold uppercase tracking-widest">{new Date(evt.startDate).toLocaleString('id-ID', { month: 'long' })}</span>
                          <span className="text-5xl font-black my-1">{new Date(evt.startDate).getDate()}</span>
                          <span className="text-xs font-medium">{new Date(evt.startDate).getFullYear()}</span>
                          <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-between relative">
                          <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md tracking-wider">{evt.category}</span>
                                {evt.tickets && evt.tickets[0]?.price === 0 && <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">Gratis</span>}
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition">{evt.title}</h3>
                          </div>
                          <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-2">
                             <p className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[150px]">📍 {evt.locationName || "Lokasi Event"}</p>
                             <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">Detail &rarr;</span>
                          </div>
                      </div>
                  </Link>
                  ))}
              </div>
            )}
        </div>

      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </main>
  );
}

const Button = ({ href, variant, className, children }: any) => (
  <Link href={href} className={`inline-block px-6 py-2 rounded-full font-semibold transition ${variant === 'outline' ? 'border border-blue-600 text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'} ${className}`}>
    {children}
  </Link>
);