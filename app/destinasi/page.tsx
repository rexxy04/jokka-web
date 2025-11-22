import React from 'react';
import Card from '@/components/ui/card';

const places = [
  { id: 1, name: "Benteng Rotterdam", category: "Sejarah", image: "/images/featured-2.jpg" },
  { id: 2, name: "Pantai Losari", category: "Alam", image: "/images/featured-main.jpg" },
  { id: 3, name: "Coto Nusantara", category: "Kuliner", image: "/images/featured-1.jpg" },
  { id: 4, name: "Malino Highlands", category: "Alam", image: "https://firebasestorage.googleapis.com/v0/b/jokka-main.firebasestorage.app/o/jokka%2Fplaces%2Fpantai_losari.webp?alt=media&token=2f4db5c7-455e-4432-9a6f-80e206728784" },
];

// 1. Tambahkan 'async' di depan function
export default async function DestinasiPage({
  searchParams,
}: {
  // 2. Ubah tipe props menjadi Promise
  searchParams: Promise<{ q?: string }>;
}) {
  // 3. Await searchParams sebelum mengambil datanya
  const params = await searchParams;
  const query = params?.q || ""; 

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Destinasi Wisata</h1>
          {query && (
            <p className="text-gray-500 mt-2">
              Menampilkan hasil pencarian untuk: <span className="font-semibold text-blue-600">"{query}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {places.map((place) => (
            <Card
              key={place.id}
              title={place.name}
              category={place.category}
              image={place.image}
              href={`/destinasi/${place.id}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}