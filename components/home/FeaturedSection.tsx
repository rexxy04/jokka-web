'use client';

import Image from "next/image";
import Button from "@/components/ui/Button"; // <--- Import Button Reusable kita

// Data Dummy
const destinations = [
  {
    id: 1,
    name: "Pantai Losari",
    category: "Alam",
    image: "/images/featured-main.jpg", 
    rating: "4.8",
    isMain: true, 
  },
  {
    id: 2,
    name: "Coto Nusantara",
    category: "Kuliner",
    image: "/images/featured-1.jpg",
    rating: "4.9",
    isMain: false,
  },
  {
    id: 3,
    name: "Benteng Rotterdam",
    category: "Sejarah",
    image: "/images/featured-2.jpg",
    rating: "4.7",
    isMain: false,
  },
  {
    id: 4,
    name: "Konser Sheila On 7",
    category: "Event",
    image: "/images/featured-3.jpg",
    rating: "Hot",
    isMain: false,
  },
  {
    id: 5,
    name: "Malino Highlands",
    category: "Alam",
    image: "/images/featured-4.jpg",
    rating: "4.6",
    isMain: false,
  },
];

const FeaturedSection = () => {
  return (
    <section id="pilihan-jokka" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Pilihan Jokka <span className="text-yellow-500">🤙</span>
            </h2>
            <p className="text-gray-500">Destinasi hits dan event seru minggu ini.</p>
          </div>
          
          {/* Tombol Desktop: Pakai Variant Ghost agar tidak terlalu mencolok */}
          <div className="hidden md:block">
            <Button href="/explore" variant="ghost">
              Lihat Semua &rarr;
            </Button>
          </div>
        </div>

        {/* --- TAMPILAN DESKTOP (BENTO GRID) --- */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
          {destinations.slice(0, 5).map((item) => (
            <div 
              key={item.id}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                item.isMain ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
              }`}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs rounded-md mb-2 border border-white/30">
                  {item.category}
                </span>
                <div className="flex justify-between items-end">
                  <h3 className={`font-bold text-white leading-tight ${item.isMain ? 'text-2xl' : 'text-lg'}`}>
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

        {/* --- TAMPILAN MOBILE (HORIZONTAL SCROLL) --- */}
        <div className="md:hidden flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
          {destinations.map((item) => (
            <div 
              key={item.id} 
              className="snap-center shrink-0 w-[80vw] h-[300px] relative rounded-2xl overflow-hidden"
            >
               <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
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

        {/* Tombol Mobile: Pakai Variant Outline */}
        <div className="mt-6 text-center md:hidden">
          <Button href="/explore" variant="outline" className="w-full">
             Lihat Semua Destinasi
          </Button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedSection;