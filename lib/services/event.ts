import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Tipe Data untuk Input Event
export interface EventFormData {
  title: string;
  description: string;
  category: string;
  locationName: string; // Nama tempat (misal: "Parking Lot Phinisi Point")
  startDate: string;    // Tanggal & Jam Mulai
  endDate: string;      // Tanggal & Jam Selesai
  ticketName: string;   // Misal: "Regular", "VIP"
  ticketPrice: number;
  ticketStock: number;
}

export const createEvent = async (formData: EventFormData, posterFile: File, organizerId: string) => {
  try {
    if (!organizerId) throw new Error("ID Organizer tidak ditemukan.");

    // 1. Upload Poster ke Storage
    // Path: events/{organizerId}/{timestamp}-{filename}
    const storageRef = ref(storage, `events/${organizerId}/${Date.now()}-${posterFile.name}`);
    const snapshot = await uploadBytes(storageRef, posterFile);
    const posterUrl = await getDownloadURL(snapshot.ref);

    // 2. Simpan Data ke Firestore
    await addDoc(collection(db, "events"), {
      organizerId: organizerId, // Penting: Biar tau siapa yang punya event
      title: formData.title,
      description: formData.description,
      category: formData.category,
      locationName: formData.locationName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      poster: posterUrl,
      
      // Struktur Tiket (Array Object biar scalable kalau mau banyak tipe tiket)
      tickets: [
        {
          name: formData.ticketName,
          price: Number(formData.ticketPrice),
          stock: Number(formData.ticketStock),
          sold: 0 // Awal dibuat pasti 0 terjual
        }
      ],

      status: 'pending_review', // Default status: Menunggu Approval Admin
      createdAt: serverTimestamp(),
    });

    return { success: true };

  } catch (error: any) {
    console.error("Error creating event:", error);
    throw new Error(error.message || "Gagal membuat event.");
  }
};