// lib/services/admin.ts
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- DATA TYPES ---
export interface EOData {
  uid: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  documents: { [key: string]: string };
  createdAt: any;
}

export interface PlaceFormData {
  name: string;
  category: string;
  rating: string;
  description: string;
  location: string;
  price: string;
  lat?: number;
  lng?: number;
}

export interface EventData {
  id: string;
  title: string;
  category: string;
  startDate: string;
  poster: string;
  posterUrl?: string;
  organizerId?: string;
  eoId?: string;
  status: string;
  locationName: string;
}

// --- MANAGEMENT EVENT (APPROVAL) ---

// 1. Ambil Event yang Pending (Merge 'pending' & 'pending_review')
export const getPendingEvents = async () => {
  try {
    const qPending = query(collection(db, "events"), where("status", "==", "pending"));
    const qReview = query(collection(db, "events"), where("status", "==", "pending_review"));
    
    const [snapPending, snapReview] = await Promise.all([getDocs(qPending), getDocs(qReview)]);

    const eventsMap = new Map();
    snapPending.docs.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    snapReview.docs.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const events = Array.from(eventsMap.values()) as EventData[];
    
    return events.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching pending events:", error);
    return [];
  }
};

// 2. Approve Event
export const approveEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { status: 'approved' });
    return true;
  } catch (error) {
    throw new Error("Gagal menyetujui event");
  }
};

// 3. Reject Event
export const rejectEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { status: 'rejected' });
    return true;
  } catch (error) {
    throw new Error("Gagal menolak event");
  }
};

// --- SERVICE: TAMBAH WISATA ---
export const addPlace = async (formData: PlaceFormData, imageFile: File) => {
  try {
    const storageRef = ref(storage, `places/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "places"), {
      ...formData,
      image: imageUrl,
      isFeatured: false,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal menambahkan wisata.");
  }
};

// --- SERVICE: EDIT WISATA ---
export const getPlaceById = async (id: string) => {
  try {
    const docRef = doc(db, "places", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const updatePlace = async (id: string, formData: PlaceFormData, newImageFile: File | null) => {
  try {
    let imageUrl = null;
    if (newImageFile) {
      const storageRef = ref(storage, `places/${Date.now()}-${newImageFile.name}`);
      const snapshot = await uploadBytes(storageRef, newImageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const updateData: any = { ...formData, updatedAt: serverTimestamp() };
    if (imageUrl) updateData.image = imageUrl;

    const docRef = doc(db, "places", id);
    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengupdate wisata.");
  }
};

// --- PARTNER & APPROVAL EO ---
export const getPendingEOs = async () => {
  try {
    const q = query(collection(db, "eos"), where("status", "==", "pending_verification"));
    const querySnapshot = await getDocs(q);
    const eos: EOData[] = [];
    querySnapshot.forEach((doc) => eos.push(doc.data() as EOData));
    return eos;
  } catch (error) {
    return [];
  }
};

export const approveEO = async (eoId: string) => {
  try {
    const eoRef = doc(db, "eos", eoId);
    await updateDoc(eoRef, { status: 'verified' });
    return true;
  } catch (error) {
    throw new Error("Gagal menyetujui EO");
  }
};

export const rejectEO = async (eoId: string) => {
  try {
    const eoRef = doc(db, "eos", eoId);
    await updateDoc(eoRef, { status: 'rejected' });
    return true;
  } catch (error) {
    throw new Error("Gagal menolak EO");
  }
};

// --- DASHBOARD STATS ---
export const getAdminStats = async () => {
  try {
    const eosRef = collection(db, "eos");
    const eosSnap = await getDocs(eosRef);
    let pendingEO = 0;
    let activeEO = 0;
    eosSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'pending_verification') pendingEO++;
      if (data.status === 'verified') activeEO++;
    });

    const placesRef = collection(db, "places");
    const placesSnap = await getDocs(placesRef);
    const totalPlaces = placesSnap.size;

    const eventsRef = collection(db, "events");
    const eventsSnap = await getDocs(eventsRef);
    let totalTicketsSold = 0;
    eventsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.tickets && data.tickets.length > 0) {
        const sold = data.tickets.reduce((acc: number, t: any) => acc + (t.sold || 0), 0);
        totalTicketsSold += sold;
      }
    });

    return { pendingEO, activeEO, totalPlaces, totalTicketsSold };
  } catch (error) {
    return { pendingEO: 0, activeEO: 0, totalPlaces: 0, totalTicketsSold: 0 };
  }
};

// --- GET ALL PLACES ---
export const getAllPlaces = async () => {
  try {
    const q = collection(db, "places");
    const querySnapshot = await getDocs(q);
    const places: any[] = [];
    querySnapshot.forEach((doc) => places.push({ id: doc.id, ...doc.data() }));
    return places;
  } catch (error) {
    return [];
  }
};

export const deletePlace = async (placeId: string) => {
  try {
    await deleteDoc(doc(db, "places", placeId));
    return true;
  } catch (error) {
    throw new Error("Gagal menghapus wisata");
  }
};

// --- PARTNER & SALES ANALYTICS (BAGIAN YANG HILANG DIKEMBALIKAN) ---

// 1. Ambil Semua Partner EO (Verified Only)
export const getVerifiedEOs = async () => {
  try {
    const q = query(collection(db, "eos"), where("status", "==", "verified"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as unknown as EOData[];
  } catch (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
};

// 2. Analisa Penjualan Global (Per EO)
export const getSalesAnalysis = async () => {
  try {
    const eos = await getVerifiedEOs();
    const eoMap: { [key: string]: string } = {}; 
    
    // Inisialisasi
    const stats: { [key: string]: { name: string, sold: number, revenue: number, eventCount: number } } = {};
    eos.forEach(eo => {
      eoMap[eo.uid] = eo.companyName;
      stats[eo.uid] = { name: eo.companyName, sold: 0, revenue: 0, eventCount: 0 };
    });

    const eventsRef = collection(db, "events");
    const eventsSnap = await getDocs(eventsRef);

    eventsSnap.forEach((doc) => {
      const data = doc.data();
      // FIX: Cek 'eoId' ATAU 'organizerId' (Support legacy data)
      const eoId = data.eoId || data.organizerId;

      if (stats[eoId]) {
        stats[eoId].eventCount += 1;
        if (data.tickets && data.tickets.length > 0) {
          const sold = data.tickets.reduce((acc: number, t: any) => acc + (t.sold || 0), 0);
          // Asumsi revenue kasar dari harga tiket pertama * total sold (jika mau detail harus loop transactions)
          const price = data.tickets[0].price || 0; 
          
          stats[eoId].sold += sold;
          stats[eoId].revenue += (sold * price);
        }
      }
    });

    return Object.values(stats).sort((a, b) => b.sold - a.sold); 

  } catch (error) {
    console.error("Error fetching sales analysis:", error);
    return [];
  }
};