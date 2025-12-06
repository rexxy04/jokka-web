import React from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import DetailView from "@/components/public/DetailView"; 

interface EventDetail {
  id: string;
  title: string;
  category: string;
  poster: string;
  description: string;
  locationName: string;
  startDate: string;
  endDate: string;
  tickets?: { name: string; price: number; stock: number }[];
}

async function getEventById(id: string) {
  try {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventDetail;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price: number) => {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-600">Event tidak ditemukan atau sudah dihapus.</p>
          <a href="/event" className="text-blue-600 hover:underline mt-4 block">Kembali ke Daftar Event</a>
        </div>
      </div>
    );
  }

  const ticketInfo = event.tickets && event.tickets.length > 0 
    ? formatPrice(event.tickets[0].price) 
    : "Info Harga Menyusul";

  return (
    <main>
      <DetailView 
        title={event.title}
        image={event.poster}
        category={event.category}
        description={event.description}
        
        // Data Khusus Event
        location={event.locationName}
        date={formatDate(event.startDate)}
        price={ticketInfo}
        
        // SAYA SUDAH HAPUS PROPS 'openTime' DAN 'closeTime' DISINI
        // Agar tidak error lagi
      />
    </main>
  );
}