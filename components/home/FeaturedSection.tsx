'use client';

import { useState, useEffect } from "react";
// import Image from "next/image"; // Kita matikan dulu Image Next.js biar gak ribet config domain
import Button from "../ui/Button"; 
import { db } from "../../lib/firebase"; // Pastikan path ini sesuai struktur folder Anda
import { collection, getDocs, query, limit } from "firebase/firestore";

// Definisikan tipe data sesuai struktur di Firestore
interface Place {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: string;
  isFeatured: boolean;
}

const FeaturedSection = () => {
  // State untuk menampung data dari Database
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const placesCollection = collection(db, "places");
        // Ambil data (limit 10 biar gak kebanyakan)
        const q = query(placesCollection, limit(10)); 
        
        const querySnapshot = await getDocs(q);
        
        const items: Place[] = [];
        querySnapshot.forEach((doc) => {
          // Gabungkan ID dokumen dengan datanya
          items.push({ id: doc.id, ...doc.data() } as Place);
        });

        // Sorting: Pastikan yang 'isFeatured: true' ada di urutan pertama (untuk kotak besar)
        items.sort((a, b) => (Number(b.isFeatured) - Number(a.isFeatured)));

        setDestinations(items);
      } catch (error) {
        console.error("Error ambil data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tampilan Loading (Skeleton sederhana)
  if (loading) {
    return (
      <section className="py-16 bg-white h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Sedang memuat data dari Firebase...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pilihan-jokka" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Pilihan Jokka <span className="text-yellow-500">🤙</span>
            </h2>
            <p className="text-gray-500">Destinasi hits langsung dari Database.</p>
          </div>
          <div className="hidden md:block">
            <Button href="/explore" variant="ghost">Lihat Semua &rarr;</Button>
          </div>
        </div>

        {/* --- DESKTOP (BENTO GRID) --- */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
          {destinations.slice(0, 5).map((item) => (
            <div 
              key={item.id}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                item.isFeatured ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
              }`}
            >
              {/* Pakai tag img biasa agar support URL eksternal tanpa config next.config.ts */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs rounded-md mb-2 border border-white/30">
                  {item.category}
                </span>
                <div className="flex justify-between items-end">
                  <h3 className={`font-bold text-white leading-tight ${item.isFeatured ? 'text-2xl' : 'text-lg'}`}>
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                    <span>⭐</span> {item.rating}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- MOBILE (HORIZONTAL SCROLL) --- */}
        <div className="md:hidden flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
          {destinations.map((item) => (
            <div key={item.id} className="snap-center shrink-0 w-[80vw] h-[300px] relative rounded-2xl overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <span className="text-xs text-white/80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                  {item.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">{item.name}</h3>
                <p className="text-yellow-400 text-sm">⭐ {item.rating}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button href="/explore" variant="outline" className="w-full">Lihat Semua Destinasi</Button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedSection;