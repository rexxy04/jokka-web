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
  sold?: number; // Optional: untuk tracking terjual
}

// Data dari Form Input
export interface EventFormData {
  title: string;
  description: string;
  category: string;
  locationName: string;
  lat: number;
  lng: number;
  startDate: string; // Format string dari input datetime-local
  endDate: string;
  tickets: TicketData[];
}

// Data Lengkap yang disimpan di Firebase
export interface EventData extends EventFormData {
  id: string;
  posterUrl: string;
  status: 'pending' | 'published' | 'rejected';
  eoId: string;
  createdAt: any;
  rejectionReason?: string;
}

// --- FUNCTIONS ---

/**
 * 1. CREATE EVENT (Khusus EO)
 * Mengupload poster ke Storage dan menyimpan data event ke Firestore.
 */
export const createEvent = async (formData: EventFormData, posterFile: File, eoId: string) => {
  try {
    // A. Upload Poster
    // Path: events/{eoId}/{timestamp_filename}
    const filename = `${Date.now()}_${posterFile.name}`;
    const storageRef = ref(storage, `events/${eoId}/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, posterFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // B. Siapkan Data Firestore
    const newEvent = {
      ...formData,
      posterUrl: downloadURL,
      eoId: eoId,
      status: 'pending', // Default status pending, nunggu admin
      createdAt: serverTimestamp(),
      // Inisialisasi sold = 0 untuk setiap tiket
      tickets: formData.tickets.map(t => ({ ...t, sold: 0 }))
    };

    // C. Simpan ke Collection 'events'
    const docRef = await addDoc(collection(db, "events"), newEvent);
    return docRef.id;

  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Gagal membuat event. Silakan coba lagi.");
  }
};

/**
 * 2. GET EO EVENTS (Khusus EO Dashboard)
 * Mengambil semua event milik EO tertentu (baik pending/oublished/rejected).
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
 * 3. GET PUBLIC EVENTS (Halaman Public)
 * Hanya mengambil event yang statusnya 'published'.
 * Diurutkan berdasarkan tanggal mulai event (startDate).
 */
export const getPublicEvents = async (): Promise<EventData[]> => {
  try {
    const q = query(
      collection(db, "events"),
      where("status", "==", "published"),
      orderBy("startDate", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventData));
  } catch (error) {
    console.error("Error fetching public events:", error);
    return [];
  }
};

/**
 * 4. GET EVENT BY ID (Halaman Detail)
 * Mengambil detail satu event berdasarkan ID.
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
 * 5. GET EVENTS BY MONTH (Kalender Event)
 * @param year Tahun (ex: 2025)
 * @param month Bulan (1-12)
 */
export const getEventsByMonth = async (year: number, month: number): Promise<EventData[]> => {
  try {
    // Format tanggal awal bulan: "YYYY-MM-01"
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    
    // Cari tanggal terakhir bulan tersebut
    const lastDay = new Date(year, month, 0).getDate();
    // Format tanggal akhir bulan: "YYYY-MM-DDTHH:mm" (sampai detik terakhir)
    const endStr = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59`;

    const q = query(
      collection(db, "events"),
      where("status", "==", "published"),
      where("startDate", ">=", startStr),
      where("startDate", "<=", endStr),
      orderBy("startDate", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EventData));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};