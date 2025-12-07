'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Hooks & Components
import { useSearch } from '@/hooks/useSearch';
import SearchHeader from '@/components/search/SearchHeader';
import EmptySearch from '@/components/search/EmptySearch';
import EventLandscapeCard from '@/components/event/EventLandscapeCard';
import DestinationCard from '@/components/destination/DestinationCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || ''; 
  const [activeTab, setActiveTab] = useState<'all' | 'event' | 'destinasi'>('all');

  // Panggil Custom Hook (Logic Data ada di sini)
  const { events, destinations, loading } = useSearch(query);

  // 1. Render Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 w-1/3 rounded-lg mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Empty State
  if (events.length === 0 && destinations.length === 0) {
    return (
        <div className="pt-32 pb-20">
            <EmptySearch query={query} />
        </div>
    );
  }

  // 3. Render Results
  return (
    <div className="container mx-auto px-4 pt-28 pb-20">
      
      {/* Header & Tabs */}
      <SearchHeader 
        query={query}
        totalEvents={events.length}
        totalDestinations={destinations.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="space-y-12">
        
        {/* --- SECTION EVENT --- */}
        {(activeTab === 'all' || activeTab === 'event') && events.length > 0 && (
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🎫</span>
              <h2 className="text-xl font-bold text-gray-900">Event Ditemukan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((item) => (
                <EventLandscapeCard 
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  location={item.locationName}
                  category={item.category}
                  image={item.posterUrl || item.poster || '/placeholder-event.jpg'}
                />
              ))}
            </div>
          </section>
        )}

        {/* --- SECTION DESTINASI --- */}
        {(activeTab === 'all' || activeTab === 'destinasi') && destinations.length > 0 && (
          <section className="animate-fade-in-up delay-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🏝️</span>
              <h2 className="text-xl font-bold text-gray-900">Destinasi Ditemukan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((item) => (
                <DestinationCard 
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  category={item.category}
                  rating={item.rating}
                  location={item.location}
                  image={item.image}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

// --- MAIN PAGE WRAPPER ---
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="pt-32 text-center text-gray-500">Memuat pencarian...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}