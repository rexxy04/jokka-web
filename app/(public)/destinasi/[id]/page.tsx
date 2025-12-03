import React from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import DetailView from "@/components/public/DetailView";
import Navbar from "@/components/public/Navbar";

// 1. Kita update tipe datanya untuk memasukkan field baru
interface PlaceDetail {
  id: string;
  name: string;
  category: string;
  image: string;
  rating?: string;
  description?: string;
  location?: string; // Field baru dari DB
  price?: string;    // Field baru dari DB
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
      <Navbar />
      
      {/* 2. Masukkan data dari variable 'place' ke props komponen */}
      <DetailView 
        title={place.name}
        image={place.image}
        category={place.category}
        rating={place.rating}
        
        // Menggunakan operator || (OR) sebagai Fallback
        // Artinya: "Coba ambil dari DB, kalau kosong, pakai teks default sebelah kanan"
        description={place.description || "Deskripsi belum tersedia untuk tempat ini."}
        
        // Fetch Location & Price dari Firestore
        location={place.location || "Makassar, Indonesia"} 
        price={place.price || "Gratis / Belum ada info"}
      />
    </main>
  );
}