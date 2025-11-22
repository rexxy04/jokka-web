import React from 'react';
import Card from '@/components/ui/card';

const events = [
  { id: 1, name: "Konser Sheila On 7", category: "Musik", image: "/images/featured-3.jpg" },
  { id: 2, name: "Makassar Jazz Festival", category: "Festival", image: "/images/featured-3.jpg" },
];

// 1. Tambahkan 'async'
export default async function EventPage({
  searchParams,
}: {
  // 2. Ubah tipe jadi Promise
  searchParams: Promise<{ q?: string }>;
}) {
  // 3. Await variable params
  const params = await searchParams;
  const query = params?.q || "";

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kalender Event</h1>
          {query && (
            <p className="text-gray-500 mt-2">
              Menampilkan hasil pencarian untuk: <span className="font-semibold text-blue-600">"{query}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((evt) => (
            <Card
              key={evt.id}
              title={evt.name}
              category={evt.category}
              image={evt.image}
              href={`/event/${evt.id}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}