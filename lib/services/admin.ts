import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Tipe Data untuk EO
export interface EOData {
  uid: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  documents: { [key: string]: string }; // URL dokumen
  createdAt: any;
}

// 1. Ambil semua EO yang statusnya PENDING
export const getPendingEOs = async () => {
  try {
    const q = query(
      collection(db, "eos"), 
      where("status", "==", "pending_verification")
    );
    
    const querySnapshot = await getDocs(q);
    const eos: EOData[] = [];
    
    querySnapshot.forEach((doc) => {
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
    throw new Error("Gagal menolak EO");
  }
};