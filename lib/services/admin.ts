import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Definisi Tipe Data EO sesuai yang disimpan saat Register
export interface EOData {
  uid: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  documents: { [key: string]: string }; // Map URL dokumen (nib, npwp, dll)
  createdAt: any;
}

// --- SERVICE: TAMBAH WISATA ---
export interface PlaceFormData {
  name: string;
  category: string;
  rating: string;
  description: string;
  location: string;
  price: string;
}

export const addPlace = async (formData: PlaceFormData, imageFile: File) => {
  try {
    // 1. Upload Gambar
    // Path: places/{timestamp}-{filename}
    const storageRef = ref(storage, `places/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // 2. Simpan ke Firestore
    await addDoc(collection(db, "places"), {
      name: formData.name,
      category: formData.category,
      rating: formData.rating,
      description: formData.description,
      location: formData.location, // Field baru
      price: formData.price,       // Field baru
      image: imageUrl,
      isFeatured: false, // Default false
      createdAt: serverTimestamp()
    });

    return { success: true };

  } catch (error: any) {
    console.error("Error adding place:", error);
    throw new Error(error.message || "Gagal menambahkan wisata.");
  }
};

// --- DASHBOARD STATS SERVICE ---
export const getAdminStats = async () => {
  try {
    // 1. Hitung Statistik EO (Sekali fetch collection 'eos' biar hemat)
    const eosRef = collection(db, "eos");
    const eosSnap = await getDocs(eosRef);
    
    let pendingEO = 0;
    let activeEO = 0;

    eosSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'pending_verification') pendingEO++;
      if (data.status === 'verified') activeEO++;
    });

    // 2. Hitung Total Wisata
    const placesRef = collection(db, "places");
    const placesSnap = await getDocs(placesRef);
    const totalPlaces = placesSnap.size;

    // 3. Hitung Total Tiket Terjual (Global dari semua event)
    const eventsRef = collection(db, "events");
    const eventsSnap = await getDocs(eventsRef);
    
    let totalTicketsSold = 0;
    eventsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.tickets && data.tickets.length > 0) {
        totalTicketsSold += (data.tickets[0].sold || 0);
      }
    });

    return {
      pendingEO,
      activeEO,
      totalPlaces,
      totalTicketsSold
    };

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { pendingEO: 0, activeEO: 0, totalPlaces: 0, totalTicketsSold: 0 };
  }
};

// 1. Ambil Semua Wisata (Untuk Tabel Admin)
export const getAllPlaces = async () => {
  try {
    // Ambil dari collection 'places'
    // Kita urutkan manual di client nanti biar fleksibel
    const q = collection(db, "places");
    const querySnapshot = await getDocs(q);
    
    const places: any[] = [];
    querySnapshot.forEach((doc) => {
      places.push({ id: doc.id, ...doc.data() });
    });
    
    return places;
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};

// 2. Hapus Wisata
export const deletePlace = async (placeId: string) => {
  try {
    await deleteDoc(doc(db, "places", placeId));
    return true;
  } catch (error) {
    throw new Error("Gagal menghapus wisata");
  }
};

// 1. Fetch EO yang statusnya PENDING
export const getPendingEOs = async () => {
  try {
    // Query: Ambil dari collection 'eos', dimana status == pending_verification
    const q = query(
      collection(db, "eos"), 
      where("status", "==", "pending_verification")
    );
    
    const querySnapshot = await getDocs(q);
    const eos: EOData[] = [];
    
    querySnapshot.forEach((doc) => {
      // Masukkan data ke array
      eos.push(doc.data() as EOData);
    });
    
    return eos;
  } catch (error) {
    console.error("Error fetching pending EOs:", error);
    return [];
  }
};

// 2. Approve EO (Ubah status jadi verified)
export const approveEO = async (eoId: string) => {
  try {
    const eoRef = doc(db, "eos", eoId);
    await updateDoc(eoRef, {
      status: 'verified'
    });
    return true;
  } catch (error) {
    console.error("Error approving EO:", error);
    throw new Error("Gagal menyetujui EO");
  }
};

// 3. Reject EO
export const rejectEO = async (eoId: string) => {
  try {
    const eoRef = doc(db, "eos", eoId);
    await updateDoc(eoRef, {
      status: 'rejected'
    });
    return true;
  } catch (error) {
    console.error("Error rejecting EO:", error);
    throw new Error("Gagal menolak EO");
  }
};

// --- MANAGEMENT EVENT ---

export interface EventData {
  id: string;
  title: string;
  category: string;
  startDate: string;
  poster: string;
  organizerId: string;
  status: string;
  locationName: string;
}

// 1. Ambil Event yang Pending Review
export const getPendingEvents = async () => {
  try {
    const q = query(
      collection(db, "events"), 
      where("status", "==", "pending_review")
    );
    
    const querySnapshot = await getDocs(q);
    const events: EventData[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as EventData);
    });
    
    return events;
  } catch (error) {
    console.error("Error fetching pending events:", error);
    return [];
  }
};

// 2. Approve Event (Ubah jadi Published) -> MUNCUL DI WEB
export const approveEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: 'published' 
    });
    return true;
  } catch (error) {
    throw new Error("Gagal menyetujui event");
  }
};

// 3. Reject Event (Tolak)
export const rejectEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: 'rejected'
    });
    return true;
  } catch (error) {
    throw new Error("Gagal menolak event");
  }
};