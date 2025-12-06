import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Tipe Data Tiket (Baru)
export interface TicketData {
  name: string;
  price: number;
  stock: number;
}

// Update Interface Form
export interface EventFormData {
  title: string;
  description: string;
  category: string;
  locationName: string;
  lat?: number;
  lng?: number;
  startDate: string;
  endDate: string;
  tickets: TicketData[]; // <--- UBAH JADI ARRAY
}

export const createEvent = async (formData: EventFormData, posterFile: File, organizerId: string) => {
  try {
    if (!organizerId) throw new Error("ID Organizer tidak ditemukan.");

    // 1. Upload Poster
    const storageRef = ref(storage, `events/${organizerId}/${Date.now()}-${posterFile.name}`);
    const snapshot = await uploadBytes(storageRef, posterFile);
    const posterUrl = await getDownloadURL(snapshot.ref);

    // 2. Simpan Data
    await addDoc(collection(db, "events"), {
      organizerId: organizerId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      locationName: formData.locationName,
      lat: formData.lat || 0,
      lng: formData.lng || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      poster: posterUrl,
      
      // Simpan Array Tiket langsung
      tickets: formData.tickets.map(t => ({
        ...t,
        sold: 0, // Inisialisasi terjual 0
        price: Number(t.price),
        stock: Number(t.stock)
      })),

      status: 'pending_review',
      createdAt: serverTimestamp(),
    });

    return { success: true };

  } catch (error: any) {
    console.error("Error creating event:", error);
    throw new Error(error.message || "Gagal membuat event.");
  }
};

// ... (Kode getPublishedEvents, getEventsByMonth, getMyEvents dll biarkan saja di bawah sini) ...
// Pastikan kode service lain tidak terhapus ya.
// Jika terhapus, copy paste dari chat sebelumnya.
// Agar aman, cukup ganti bagian interface dan createEvent di atas saja.
export const getPublishedEvents = async () => {
  try {
    const q = query(
      collection(db, "events"), 
      where("status", "==", "published") 
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const getEventsByMonth = async (monthIndex: number, year: number) => {
  try {
    const allEvents = await getPublishedEvents();
    return allEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === year;
    });
  } catch (error) {
    return [];
  }
};

export const getMyEvents = async (eoId: string) => {
  try {
    const q = query(collection(db, "events"), where("organizerId", "==", eoId));
    const querySnapshot = await getDocs(q);
    const events: any[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching my events:", error);
    return [];
  }
};

export const getEOStats = async (eoId: string) => {
  try {
    const q = query(collection(db, "events"), where("organizerId", "==", eoId));
    const querySnapshot = await getDocs(q);
    let totalEvents = 0;
    let ticketsSold = 0;
    let totalRevenue = 0;
    let pendingEvents = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalEvents++;
      // Hitung Loop Tiket (Update Support Multi Tiket)
      if (data.tickets && Array.isArray(data.tickets)) {
        data.tickets.forEach((t: any) => {
           const sold = t.sold || 0;
           const price = t.price || 0;
           ticketsSold += sold;
           totalRevenue += (sold * price);
        });
      }
      if (data.status === 'pending_review') pendingEvents++;
    });

    return { totalEvents, ticketsSold, totalRevenue, pendingEvents };
  } catch (error) {
    return { totalEvents: 0, ticketsSold: 0, totalRevenue: 0, pendingEvents: 0 };
  }
};

export const getEOSalesReport = async (eoId: string) => {
  try {
    const qEvents = query(collection(db, "events"), where("organizerId", "==", eoId));
    const eventsSnap = await getDocs(qEvents);
    const myEventIds: string[] = [];
    const eventNames: { [key: string]: string } = {};

    eventsSnap.forEach((doc) => {
      myEventIds.push(doc.id);
      eventNames[doc.id] = doc.data().title;
    });

    if (myEventIds.length === 0) return []; 

    const transactionsRef = collection(db, "transactions");
    const allSales: any[] = [];
    
    for (const eventId of myEventIds) {
      const qTrans = query(
        transactionsRef, 
        where("eventId", "==", eventId),
        where("status", "==", "settlement") 
      );
      const transSnap = await getDocs(qTrans);
      
      transSnap.forEach((doc) => {
        const data = doc.data();
        allSales.push({
          id: doc.id,
          ...data,
          eventName: eventNames[data.eventId] 
        });
      });
    }
    return allSales.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    return [];
  }
};