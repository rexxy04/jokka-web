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