// hooks/useSearch.ts
import { useState, useEffect } from 'react';
import { getPublicEvents, EventData } from '@/lib/services/event';
import { getAllDestinations, DestinationData } from '@/lib/services/destination';

export const useSearch = (query: string) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Semua Data (Parallel)
        const [allEvents, allDestinations] = await Promise.all([
          getPublicEvents(),
          getAllDestinations()
        ]);

        const lowerQ = query.toLowerCase().trim();

        if (!lowerQ) {
          setEvents([]);
          setDestinations([]);
          return;
        }

        // 2. Filter Logic (Events)
        const filteredEvents = allEvents.filter(item => 
          item.title?.toLowerCase().includes(lowerQ) ||
          item.category?.toLowerCase().includes(lowerQ) ||
          item.locationName?.toLowerCase().includes(lowerQ)
        );

        // 3. Filter Logic (Destinations)
        const filteredDestinations = allDestinations.filter(item => 
          item.name?.toLowerCase().includes(lowerQ) ||
          item.category?.toLowerCase().includes(lowerQ) ||
          item.location?.toLowerCase().includes(lowerQ)
        );

        setEvents(filteredEvents);
        setDestinations(filteredDestinations);

      } catch (error) {
        console.error("Error searching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  return { events, destinations, loading };
};