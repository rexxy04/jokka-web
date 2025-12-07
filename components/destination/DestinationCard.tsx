// components/destination/DestinationCard.tsx
import React from 'react';
import Link from 'next/link';

interface DestinationCardProps {
  id: string;
  title: string;
  category: string;
  rating: string | number;
  location: string;
  image: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  title,
  category,
  rating,
  location,
  image
}) => {
  return (
    <Link 
      href={`/destinasi/${id}`} 
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 block h-full"
    >
      {/* Image Container */}
      <div className="h-48 overflow-hidden relative bg-gray-200">
        <img 
          src={image || 'https://images.unsplash.com/photo-1563294676-4b6807897042?auto=format&fit=crop&q=80&w=800'} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
          <span className="text-yellow-500">⭐</span> {rating || '4.5'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
            {category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 truncate max-w-[150px]">
            📍 {location}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;