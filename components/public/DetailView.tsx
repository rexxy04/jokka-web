import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

interface DetailViewProps {
  title: string;
  image: string;
  category: string;
  rating?: string;
  description?: string;
  location?: string;
  date?: string; // Khusus Event
  price?: string;
}

const DetailView: React.FC<DetailViewProps> = ({
  title,
  image,
  category,
  rating,
  description,
  location,
  date,
  price,
}) => {
  return (
    <article className="bg-white min-h-screen pb-20">
      {/* --- HERO IMAGE --- */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Tombol Back (Floating) */}
        <div className="absolute top-24 left-4 md:left-8 z-10">
           <Link href="/destinasi" className="flex items-center gap-2 text-white/80 hover:text-white transition bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
             &larr; Kembali
           </Link>
        </div>

        {/* Judul di atas Gambar */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-md mb-3 inline-block shadow-lg">
              {category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-gray-200 text-sm md:text-base">
              {rating && <span className="flex items-center gap-1 text-yellow-400 font-bold">⭐ {rating}</span>}
              {location && <span className="flex items-center gap-1">📍 {location}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="container mx-auto px-4 py-12 md:flex gap-12">
        
        {/* Kolom Kiri: Deskripsi */}
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Tempat Ini</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {description || "Belum ada deskripsi lengkap untuk tempat ini."}
          </p>
        </div>

        {/* Kolom Kanan: Info Box (Sticky) */}
        <div className="md:w-1/3 mt-8 md:mt-0">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Informasi Penting</h3>
            
            <ul className="space-y-4 mb-6">
              {date && (
                 <li className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Tanggal</span>
                   <span className="font-medium text-gray-900 text-right">{date}</span>
                 </li>
              )}
              {price && (
                 <li className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Harga Tiket</span>
                   <span className="font-medium text-green-600 text-right">{price}</span>
                 </li>
              )}
              <li className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-blue-600 text-right">Buka Sekarang</span>
              </li>
            </ul>

            <Button variant="primary" className="w-full justify-center py-3 text-lg">
              Ambil Tiket / Reservasi
            </Button>
          </div>
        </div>

      </div>
    </article>
  );
};

export default DetailView;