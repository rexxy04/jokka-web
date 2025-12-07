// components/event/EventPortraitCard.tsx
import React from 'react';
import Link from 'next/link';

interface EventPortraitCardProps {
  id: string;
  title: string;
  date: string;
  image: string;
}

const EventPortraitCard: React.FC<EventPortraitCardProps> = ({ id, title, date, image }) => {
  return (
    <Link href={`/event/${id}`} className="block group relative h-[400px] w-full min-w-[260px] overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-300 hover:-translate-y-2">
      {/* Image Background */}
      <img 
        src={image} 
        alt={title} 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Overlay Gradient (Supaya teks terbaca) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

      {/* Konten Text di Bawah */}
      <div className="absolute bottom-0 left-0 w-full p-6">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{title}</h3>
        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
};

export default EventPortraitCard;