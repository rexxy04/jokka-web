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
 * 4. GET EO SALES STATS (Grafik & Counter) [FIXED MERGE QUERY]
 * Mengambil event dari 'eoId' DAN 'organizerId' secara bersamaan agar tidak ada yang terlewat.
 */
export const getEOSalesStats = async (eoId: string) => {
  try {
    // A. Ambil Event dengan 'eoId' (Data Baru)
    const qNew = query(collection(db, "events"), where("eoId", "==", eoId));
    
    // B. Ambil Event dengan 'organizerId' (Data Lama)
    const qLegacy = query(collection(db, "events"), where("organizerId", "==", eoId));

    // Jalankan KEDUANYA secara paralel
    const [snapNew, snapLegacy] = await Promise.all([getDocs(qNew), getDocs(qLegacy)]);
    
    // Gabungkan semua ID Event yang ditemukan (Gunakan Set biar unik)
    const eventIdsSet = new Set<string>();
    snapNew.forEach(doc => eventIdsSet.add(doc.id));
    snapLegacy.forEach(doc => eventIdsSet.add(doc.id));

    const myEventIds = Array.from(eventIdsSet);

    // Jika tidak punya event sama sekali, return kosong
    if (myEventIds.length === 0) return []; 

    // C. Ambil Transaksi Per Event
    const allTransactions: any[] = [];
    
    await Promise.all(myEventIds.map(async (eventId) => {
        const qTrans = query(
            collection(db, "transactions"),
            where("eventId", "==", eventId),
            where("status", "in", ["settlement", "capture"]) // Hanya yang LUNAS
        );
        const transSnap = await getDocs(qTrans);
        
        transSnap.forEach((doc) => {
            allTransactions.push(doc.data());
        });
    }));

    // D. Kelompokkan Data per Bulan
    const monthlyData = [
      { name: 'Jan', total: 0, count: 0 }, { name: 'Feb', total: 0, count: 0 }, 
      { name: 'Mar', total: 0, count: 0 }, { name: 'Apr', total: 0, count: 0 }, 
      { name: 'Mei', total: 0, count: 0 }, { name: 'Jun', total: 0, count: 0 },
      { name: 'Jul', total: 0, count: 0 }, { name: 'Agu', total: 0, count: 0 }, 
      { name: 'Sep', total: 0, count: 0 }, { name: 'Okt', total: 0, count: 0 }, 
      { name: 'Nov', total: 0, count: 0 }, { name: 'Des', total: 0, count: 0 },
    ];

    allTransactions.forEach((t: any) => {
      let date;
      // Parsing Tanggal (Support String & Timestamp)
      if (t.transactionTime) {
         if (typeof t.transactionTime === 'string') {
            const safeString = t.transactionTime.replace(' ', 'T');
            date = new Date(safeString);
         } else if (t.transactionTime.toDate) {
            date = t.transactionTime.toDate();
         }
      } else if (t.createdAt) {
         date = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      }

      if (date && !isNaN(date.getTime())) {
          const monthIndex = date.getMonth(); 
          if (monthIndex >= 0 && monthIndex <= 11) {
            monthlyData[monthIndex].total += Number(t.amount || 0); 
            monthlyData[monthIndex].count += Number(t.qty || 1); 
          }
      }
    });

    return monthlyData;

  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return [];
  }
};