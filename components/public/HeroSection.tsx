'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'wisata' | 'event'>('wisata');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    const targetPage = activeTab === 'wisata' ? '/destinasi' : '/event';
    if (searchTerm.trim()) {
      router.push(`${targetPage}?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(targetPage);
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      
      {/* --- BAGIAN BACKGROUND --- */}
      <img 
        src="/images/wil-house.png" 
        alt="Background Kota" 
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />
      
      {/* Overlay Hitam Transparan (Supaya teks terbaca) */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* ------------------------- */}

      {/* Konten Utama (Teks & Search) */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Jelajahi Sudut Kota <br className="hidden md:block" />
          <span className="text-yellow-400">Tanpa Batas.</span>
        </h1>
        <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
          Temukan destinasi wisata terbaik dan event seru yang sedang berlangsung di sekitarmu.
        </p>

        {/* Search Widget */}
        <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-3xl mx-auto">
          
          {/* Tab Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
            <button 
              onClick={() => setActiveTab('wisata')}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'wisata' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🏞️ Tempat Wisata
            </button>
            <button 
              onClick={() => setActiveTab('event')}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'event' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎫 Event & Show
            </button>
          </div>

          {/* Input Form */}
          <div className="flex flex-col md:flex-row gap-3 px-4 pb-4">
            {activeTab === 'wisata' ? (
              <>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Mau kemana? (Cth: Pantai, Museum...)" 
                  className="grow p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <select className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 bg-white">
                  <option>Semua Kategori</option>
                  <option>Alam</option>
                  <option>Kuliner</option>
                </select>
              </>
            ) : (
              <>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari event? (Cth: Konser Jazz...)" 
                  className="grow p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <input 
                  type="date"
                  className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                />
              </>
            )}
            
            <button 
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
            >
              Cari
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;