import React from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import DetailView from "@/components/public/DetailView"; 
import Navbar from "@/components/public/Navbar";

interface PlaceDetail {
  id: string;
  name: string;
  category: string;
  image: string;
  rating?: string;
  description?: string;
  location?: string; 
  price?: string;    
  // Tambahan Koordinat
  lat?: number;
  lng?: number;
}

async function getPlaceById(id: string) {
  const docRef = doc(db, "places", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PlaceDetail;
  } else {
    return null;
  }
}

export default async function DestinasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-600">Destinasi tidak ditemukan :(</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Navbar otomatis ada di layout, tapi kalau struktur file kamu beda, boleh pakai ini */}
      
      <DetailView 
        id={place.id}
        type="place"
        title={place.name}
        image={place.image}
        category={place.category}
        rating={place.rating}
        description={place.description || "Deskripsi belum tersedia."}
        location={place.location || "Makassar, Indonesia"} 
        price={place.price || "Gratis / Belum ada info"}
        
        // --- KIRIM KOORDINAT ---
        lat={place.lat}
        lng={place.lng}
      />
    </main>
  );
}