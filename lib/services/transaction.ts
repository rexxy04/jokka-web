import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  doc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';

export interface Transaction {
  id: string;
  orderId: string;
  eventId: string;
  eventName: string; 
  userId: string;
  amount: number;
  status: string; 
  paymentType: string;
  transactionTime: string;
  createdAt: any;
}

// 1. Simpan Transaksi Baru & Update Stok Event
export const saveTransaction = async (data: any) => {
  try {
    // A. Simpan data transaksi ke collection 'transactions'
    await addDoc(collection(db, 'transactions'), {
      ...data,
      createdAt: serverTimestamp()
    });

    // B. UPDATE DATA EVENT (Stok & Terjual)
    // Hanya update jika statusnya SUKSES (settlement/capture) atau PENDING
    // (Asumsi: Pending sudah booking kuota biar gak direbut orang)
    if (data.status === 'settlement' || data.status === 'capture' || data.status === 'pending') {
      const eventRef = doc(db, "events", data.eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        const tickets = eventData.tickets || [];

        // Asumsi: Kita update tiket pertama (Index 0)
        // Karena form create event kita baru support 1 tipe tiket
        if (tickets.length > 0) {
          const updatedTickets = [...tickets];
          // Tambah terjual, Kurangi stok
          updatedTickets[0].sold = (updatedTickets[0].sold || 0) + 1;
          updatedTickets[0].stock = (updatedTickets[0].stock || 0) - 1;

          await updateDoc(eventRef, {
            tickets: updatedTickets
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw new Error("Gagal menyimpan riwayat transaksi");
  }
};

// 2. Ambil Transaksi milik User tertentu
export const getUserTransactions = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc') 
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};