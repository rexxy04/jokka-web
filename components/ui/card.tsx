import React from 'react';
import Link from 'next/link';

interface CardProps {
  title: string;
  image: string;
  category: string;
  href: string; // Link tujuan saat kartu diklik
}

const Card: React.FC<CardProps> = ({ title, image, category, href }) => {
  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 h-full flex flex-col">
        {/* Bagian Gambar (Foto Kecil/Compact) */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Badge Kategori */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm rounded-md text-gray-700 shadow-sm">
              {category}
            </span>
          </div>
        </div>

        {/* Bagian Judul */}
        <div className="p-4 grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
              {title}
            </h3>
          </div>
          {/* Hiasan panah kecil */}
          <div className="mt-3 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
            Lihat Detail &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;