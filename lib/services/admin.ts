import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

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