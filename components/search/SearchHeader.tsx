// components/search/SearchHeader.tsx
import React from 'react';

interface SearchHeaderProps {
  query: string;
  totalEvents: number;
  totalDestinations: number;
  activeTab: 'all' | 'event' | 'destinasi';
  onTabChange: (tab: 'all' | 'event' | 'destinasi') => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  query, totalEvents, totalDestinations, activeTab, onTabChange 
}) => {
  return (
    <div className="text-center mb-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Hasil pencarian: <span className="text-blue-600">"{query}"</span>
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Ditemukan {totalEvents} event dan {totalDestinations} destinasi.
      </p>

      {/* Tab Filter */}
      <div className="inline-flex bg-gray-100 p-1 rounded-full">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'event', label: 'Event' },
          { id: 'destinasi', label: 'Destinasi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHeader;