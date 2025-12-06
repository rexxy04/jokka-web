import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  orderId: string;
  eventId: string;
  eventName: string; // Kita simpan nama event biar gampang ditampilkan
  userId: string;
  amount: number;
  status: string; // 'settlement' (sukses), 'pending', 'expire', dll
  paymentType: string;
  transactionTime: string;
  createdAt: any;
}

// 1. Simpan Transaksi Baru
export const saveTransaction = async (data: any) => {
  try {
    await addDoc(collection(db, 'transactions'), {
      ...data,
      createdAt: serverTimestamp()
    });
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
      orderBy('createdAt', 'desc') // Urutkan dari yang terbaru
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};