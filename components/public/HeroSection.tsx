// components/public/HeroSection.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  // Logic Pencarian
  const handleSearch = () => {
    if (query.trim() === '') return; // Cegah pencarian kosong
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Logic tekan tombol Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative h-[600px] flex items-center justify-center">
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/Hero-image-jokka.png" // Pastikan path gambar benar
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay Gradient untuk Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
        
        {/* PERUBAHAN DISINI: 
            1. Menggunakan 'leading-none' agar jarak antar baris sangat rapat.
            2. Menghapus 'mt-2' pada span agar tidak ada margin tambahan.
        */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight animate-fade-in-up leading-none">
          Jelajahi Serunya
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            Kota Makassar.
          </span>
        </h1>
        
        <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up delay-100">
          Portal informasi event musik, destinasi wisata, dan kuliner lokal terbaik untuk melengkapi pengalaman Jokka-jokka kamu.
        </p>

        {/* Search Bar Besar */}
        <div className="bg-white p-2 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto transform transition-all hover:scale-[1.02] focus-within:scale-[1.02] focus-within:ring-4 focus-within:ring-blue-500/30 animate-fade-in-up delay-200">
          
          <div className="pl-6 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input 
            type="text" 
            placeholder="Cari konser, pantai, atau coto..." 
            className="w-full px-4 py-3 outline-none text-gray-700 text-lg rounded-full placeholder:text-gray-400 bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          <button 
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            Cari
          </button>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;