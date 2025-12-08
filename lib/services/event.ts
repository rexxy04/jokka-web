// lib/services/event.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// --- TIPE DATA (INTERFACES) ---

export interface TicketData {
  name: string;
  price: number;
  stock: number;
  sold?: number; 
}

// Data dari Form Input
export interface EventFormData {
  title: string;
  description: string;
  category: string;
  locationName: string;
  lat: number;
  lng: number;
  startDate: string; 
  endDate: string;
  tickets: TicketData[];
}

// Data Lengkap yang disimpan di Firebase
export interface EventData extends EventFormData {
  id: string;
  posterUrl?: string; // update: optional
  poster?: string;    // update: optional (support legacy)
  status: 'pending' | 'published' | 'approved' | 'rejected'; // update: tambah 'approved'
  eoId: string;
  createdAt: any;
  rejectionReason?: string;
}

// --- FUNCTIONS ---

/**
 * 1. CREATE EVENT (Khusus EO)
 */
export const createEvent = async (formData: EventFormData, posterFile: File, eoId: string) => {
  try {
    const filename = `${Date.now()}_${posterFile.name}`;
    const storageRef = ref(storage, `events/${eoId}/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, posterFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const newEvent = {
      ...formData,
      posterUrl: downloadURL,
      eoId: eoId,
      status: 'pending', 
      createdAt: serverTimestamp(),
      tickets: formData.tickets.map(t => ({ ...t, sold: 0 }))
    };

    const docRef = await addDoc(collection(db, "events"), newEvent);
    return docRef.id;

  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Gagal membuat event. Silakan coba lagi.");
  }
};

/**
 * 2. GET EO EVENTS (Khusus EO Dashboard)
 */
export const getEOEvents = async (eoId: string): Promise<EventData[]> => {
  try {
    const q = query(
      collection(db, "events"), 
      where("eoId", "==", eoId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventData));
  } catch (error) {
    console.error("Error fetching EO events:", error);
    return [];
  }
};

/**
 * 3. GET PUBLIC EVENTS (Halaman Public) [FIXED]
 * Mengambil event yang statusnya 'approved' ATAU 'published' (Support legacy).
 */
export const getPublicEvents = async (): Promise<EventData[]> => {
  try {
    // 1. Coba ambil yang status 'approved' (Format baru)
    const qApproved = query(
      collection(db, "events"),
      where("status", "==", "approved"),
      orderBy("startDate", "asc")
    );

    // 2. Coba ambil yang status 'published' (Format lama)
    const qPublished = query(
      collection(db, "events"),
      where("status", "==", "published"),
      orderBy("startDate", "asc")
    );

    const [snapApproved, snapPublished] = await Promise.all([
        getDocs(qApproved), 
        getDocs(qPublished)
    ]);

    // Gabungkan hasil (Merge)
    const eventsMap = new Map();
    snapPublished.docs.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    snapApproved.docs.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const events = Array.from(eventsMap.values()) as EventData[];

    // Sort lagi manual (asc date) agar urutannya benar setelah di-merge
    return events.sort((a: any, b: any) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB; 
    });

  } catch (error) {
    console.error("Error fetching public events:", error);
    return [];
  }
};

/**
 * 4. GET EVENT BY ID (Halaman Detail)
 */
export const getEventById = async (id: string): Promise<EventData | null> => {
  try {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event detail:", error);
    throw new Error("Gagal mengambil detail event.");
  }
};

/**
 * 5. GET EVENTS BY MONTH (Kalender Event) [FIXED]
 */
export const getEventsByMonth = async (year: number, month: number): Promise<EventData[]> => {
  try {
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59`;

    // Ambil Approved
    const qApproved = query(
      collection(db, "events"),
      where("status", "==", "approved"),
      where("startDate", ">=", startStr),
      where("startDate", "<=", endStr),
      orderBy("startDate", "asc")
    );

    // Ambil Published (Legacy)
    const qPublished = query(
      collection(db, "events"),
      where("status", "==", "published"),
      where("startDate", ">=", startStr),
      where("startDate", "<=", endStr),
      orderBy("startDate", "asc")
    );

    const [snapApproved, snapPublished] = await Promise.all([
        getDocs(qApproved), 
        getDocs(qPublished)
    ]);

    const eventsMap = new Map();
    snapPublished.docs.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    snapApproved.docs.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const events = Array.from(eventsMap.values()) as EventData[];

    return events.sort((a: any, b: any) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
    });

  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};