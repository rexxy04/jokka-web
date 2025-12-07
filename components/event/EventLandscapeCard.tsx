// components/event/EventLandscapeCard.tsx
import React from 'react';
import Link from 'next/link';

interface EventLandscapeCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  image: string;
}

const EventLandscapeCard: React.FC<EventLandscapeCardProps> = ({ id, title, description, location, category, image }) => {
  return (
    <Link href={`/event/${id}`} className="group block bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {/* Category Badge (Pill Shape) */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm uppercase tracking-wide">
          {category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium border-t border-gray-50 pt-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
        </div>
      </div>
    </Link>
  );
};

export default EventLandscapeCard;