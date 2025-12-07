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
  ticketType?: string; // Opsional: Jenis tiket
  qty?: number;        // Opsional: Jumlah tiket
}

/**
 * 1. SIMPAN TRANSAKSI BARU & UPDATE STOK
 */
export const saveTransaction = async (data: any) => {
  try {
    // A. Simpan data transaksi ke collection 'transactions'
    await addDoc(collection(db, 'transactions'), {
      ...data,
      createdAt: serverTimestamp()
    });

    // B. UPDATE DATA EVENT (Stok & Terjual)
    // Hanya update jika statusnya SUKSES atau PENDING
    if (['settlement', 'capture', 'pending'].includes(data.status)) {
      const eventRef = doc(db, "events", data.eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        const tickets = eventData.tickets || [];

        if (tickets.length > 0) {
          const updatedTickets = [...tickets];
          
          // Cari index tiket yang dibeli berdasarkan Nama Tiket (ticketType)
          // Jika tidak ketemu, fallback ke index 0
          const ticketIndex = data.ticketType 
            ? updatedTickets.findIndex((t: any) => t.name === data.ticketType)
            : 0;

          const targetIndex = ticketIndex >= 0 ? ticketIndex : 0;
          const quantity = data.qty || 1;

          // Update Sold & Stock
          updatedTickets[targetIndex].sold = (updatedTickets[targetIndex].sold || 0) + quantity;
          updatedTickets[targetIndex].stock = (updatedTickets[targetIndex].stock || 0) - quantity;

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

/**
 * 2. AMBIL TRANSAKSI MILIK USER (History Belanja)
 */
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

/**
 * 3. VALIDASI TIKET (Check-in Scanner)
 */
export const verifyTicket = async (orderId: string, currentEoId: string) => {
  try {
    // A. Cari Transaksi berdasarkan Order ID
    const q = query(
      collection(db, 'transactions'),
      where('orderId', '==', orderId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Tiket tidak ditemukan. Cek kembali Order ID.");
    }

    const ticketDoc = snapshot.docs[0];
    const ticketData = ticketDoc.data();

    // B. Cek Status Pembayaran
    if (ticketData.status !== 'settlement' && ticketData.status !== 'capture') {
      throw new Error(`Tiket belum lunas (Status: ${ticketData.status})`);
    }

    // C. Cek Kepemilikan Event (Security)
    const eventRef = doc(db, "events", ticketData.eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new Error("Data event tidak ditemukan (mungkin terhapus).");
    }

    const eventData = eventSnap.data();
    
    // Perbaikan: Gunakan 'eoId' sesuai skema database kita
    if (eventData.eoId !== currentEoId) { 
      throw new Error("Tiket ini bukan untuk event Anda!");
    }

    // D. Cek Apakah Sudah Dipakai?
    if (ticketData.redeemedAt) {
      // Convert timestamp firestore ke date string
      const dateUsed = new Date(ticketData.redeemedAt.seconds * 1000).toLocaleString('id-ID');
      throw new Error(`Tiket SUDAH DIPAKAI pada ${dateUsed}`);
    }

    // E. UPDATE: Tandai tiket sudah dipakai (Check-in)
    await updateDoc(doc(db, "transactions", ticketDoc.id), {
      redeemedAt: serverTimestamp()
    });

    return {
      success: true,
      ticket: {
        eventName: ticketData.eventName,
        buyerId: ticketData.userId,
        amount: ticketData.amount,
        ticketType: ticketData.ticketType || "Regular"
      }
    };

  } catch (error: any) {
    throw new Error(error.message || "Gagal memvalidasi tiket.");
  }
};

/**
 * 4. GET EO SALES STATS (Grafik & Counter) [UPDATED]
 * Mengembalikan data grafik bulan + total tiket terjual per bulan.
 */
export const getEOSalesStats = async (eoId: string) => {
  try {
    // A. Ambil semua ID Event milik EO
    const eventsQuery = query(collection(db, "events"), where("eoId", "==", eoId));
    let eventsSnapshot = await getDocs(eventsQuery);

    if (eventsSnapshot.empty) {
       const legacyQuery = query(collection(db, "events"), where("organizerId", "==", eoId));
       eventsSnapshot = await getDocs(legacyQuery); 
    }
    
    const eoEventIds = eventsSnapshot.docs.map(doc => doc.id);

    if (eoEventIds.length === 0) return []; 

    // B. Ambil Transaksi Lunas
    const transQuery = query(
      collection(db, "transactions"),
      where("status", "in", ["settlement", "capture"]),
      orderBy("transactionTime", "asc")
    );

    const transSnapshot = await getDocs(transQuery);
    
    // Filter manual transaction milik EO ini
    const eoTransactions = transSnapshot.docs
      .map(doc => doc.data())
      .filter((t: any) => eoEventIds.includes(t.eventId));

    // C. Kelompokkan Data per Bulan
    // Kita tambahkan properti 'count' untuk menghitung jumlah tiket
    const monthlyData = [
      { name: 'Jan', total: 0, count: 0 }, { name: 'Feb', total: 0, count: 0 }, 
      { name: 'Mar', total: 0, count: 0 }, { name: 'Apr', total: 0, count: 0 }, 
      { name: 'Mei', total: 0, count: 0 }, { name: 'Jun', total: 0, count: 0 },
      { name: 'Jul', total: 0, count: 0 }, { name: 'Agu', total: 0, count: 0 }, 
      { name: 'Sep', total: 0, count: 0 }, { name: 'Okt', total: 0, count: 0 }, 
      { name: 'Nov', total: 0, count: 0 }, { name: 'Des', total: 0, count: 0 },
    ];

    eoTransactions.forEach((t: any) => {
      let date;
      if (t.transactionTime?.toDate) {
        date = t.transactionTime.toDate(); 
      } else {
        date = new Date(t.transactionTime); 
      }

      const monthIndex = date.getMonth(); 
      
      if (monthIndex >= 0 && monthIndex <= 11) {
        monthlyData[monthIndex].total += Number(t.amount); 
        monthlyData[monthIndex].count += (t.qty || 1); // Tambah jumlah tiket (default 1 jika field qty ga ada)
      }
    });

    return monthlyData;

  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return [];
  }
};