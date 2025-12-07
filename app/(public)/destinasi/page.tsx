'use client';

import React, { useEffect, useState } from 'react';
import { getAllDestinations, DestinationData } from '@/lib/services/destination';
import DestinationCard from '@/components/destination/DestinationCard';

export default function DestinasiPage() {
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Daftar Kategori Khusus Destinasi Wisata
  const categories = [
    'Semua', 
    'Alam', 
    'Kuliner', 
    'Sejarah', 
    'Religi', 
    'Belanja', 
    'Rekreasi'
  ];

  // 1. Fetch Semua Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDestinations();
        setDestinations(data);
      } catch (error) {
        console.error("Gagal memuat destinasi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Logic Filter
  const filteredDestinations = selectedCategory === 'Semua'
    ? destinations
    : destinations.filter(item => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Destinasi Wisata 🏝️
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan keindahan tersembunyi, kuliner lezat, dan tempat bersejarah di sekitar Anda.
          </p>
        </div>

        {/* --- FILTER CATEGORY (Scrollable) --- */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2 overflow-x-auto pb-4 max-w-full scrollbar-hide px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID CONTENT --- */}
        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[300px] border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl mb-4"></div>
                <div className="px-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDestinations.length > 0 ? (
          // Data Real
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-500">
            {filteredDestinations.map((place) => (
              <DestinationCard 
                key={place.id}
                id={place.id}
                title={place.name} // Sesuaikan field DB (name/title)
                category={place.category}
                rating={place.rating}
                location={place.location}
                image={place.image}
              />
            ))}
          </div>
        ) : (
          // Empty State (Jika filter tidak menemukan hasil)
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800">Tidak ditemukan</h3>
            <p className="text-gray-500 mt-2">
              Belum ada destinasi untuk kategori <span className="font-bold text-blue-600">"{selectedCategory}"</span>.
            </p>
            <button 
              onClick={() => setSelectedCategory('Semua')}
              className="mt-6 text-blue-600 font-bold hover:underline text-sm"
            >
              Tampilkan Semua
            </button>
          </div>
        )}

      </div>
    </main>
  );
}