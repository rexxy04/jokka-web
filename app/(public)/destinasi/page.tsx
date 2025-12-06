import React from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Pastikan path import ini benar (bisa juga "../../lib/firebase")
import Card from '@/components/ui/card';

// Definisi Tipe Data (Biar TypeScript tidak marah)
interface Place {
  id: string;
  name: string;
  category: string;
  image: string;
}

// Helper Function: Ambil semua data dari Firestore
async function getPlacesFromFirestore() {
  try {
    // Mengambil referensi ke koleksi "places"
    const placesCol = collection(db, "places");
    const placeSnapshot = await getDocs(placesCol);
    
    // Mapping data dari format Firebase ke format Array JavaScript biasa
    const placeList = placeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Place[];

    return placeList;
  } catch (error) {
    console.error("Gagal mengambil data destinasi:", error);
    return []; // Kembalikan array kosong jika error
  }
}

export default async function DestinasiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // 1. Ambil parameter pencarian dari URL (jika ada)
  const params = await searchParams;
  const query = (params?.q || "").toLowerCase(); 

  // 2. Ambil data RIL dari Firebase (Server-side fetching)
  const allPlaces = await getPlacesFromFirestore();

  // 3. Filter data berdasarkan query pencarian (Search Logic)
  const filteredPlaces = allPlaces.filter((place) => {
    // Mencocokkan Nama atau Kategori dengan kata kunci pencarian
    return (
      place.name.toLowerCase().includes(query) || 
      place.category.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        
        {/* Header Halaman */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Destinasi Wisata</h1>
          {query && (
            <p className="text-gray-500 mt-2">
              Menampilkan hasil pencarian untuk: <span className="font-semibold text-blue-600">"{query}"</span>
            </p>
          )}
        </div>

        {/* Logic Tampilan: Loading / Kosong / Ada Data */}
        {filteredPlaces.length === 0 ? (
           // Tampilan jika data tidak ditemukan
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <p className="text-gray-400 text-lg mb-4">Belum ada destinasi yang cocok nih.</p>
             {query && (
               <a href="/destinasi" className="text-blue-600 hover:underline text-sm">
                 Hapus pencarian & lihat semua
               </a>
             )}
           </div>
        ) : (
          // Tampilan Grid Card (Sama seperti sebelumnya, tapi datanya asli)
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPlaces.map((place) => (
              <Card
                key={place.id}
                title={place.name}
                category={place.category}
                image={place.image}
                href={`/destinasi/${place.id}`} // Link ke halaman detail dinamis
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}