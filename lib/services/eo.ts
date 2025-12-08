// lib/services/eo.ts
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, query, where, collection, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Definisi Tipe Data agar TypeScript senang
export interface EOFormData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  phone: string;
  address: string;
}

export interface EOFiles {
  [key: string]: File | null;
}

// Interface Data Event (Sesuaikan jika perlu)
export interface EventData {
  id: string;
  title: string;
  category: string;
  startDate: string;
  locationName: string;
  status: string;
  tickets: any[];
  posterUrl?: string;
  poster?: string;
  sold?: number;
  realSold?: number;
  createdAt: any;
}

// --- SERVICE: REGISTER EO ---
export const registerEO = async (formData: EOFormData, files: EOFiles) => {
  try {
    // 1. Buat Akun di Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;

    // 2. Upload Dokumen ke Storage
    const uploadedUrls: { [key: string]: string } = {};
    
    // Kita gunakan Promise.all agar upload berjalan paralel (lebih cepat)
    const uploadPromises = Object.entries(files).map(async ([key, file]) => {
      if (file) {
        // Path: documents/eos/{UID}/{jenis_dokumen}
        const storageRef = ref(storage, `documents/eos/${user.uid}/${key}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { key, url };
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);
    
    // Rapikan hasil upload ke object uploadedUrls
    results.forEach((res) => {
      if (res) uploadedUrls[res.key] = res.url;
    });

    // 3. Simpan Data Profil ke Firestore
    await setDoc(doc(db, "eos", user.uid), {
      uid: user.uid,
      email: formData.email,
      fullName: formData.fullName,
      companyName: formData.companyName,
      phone: formData.phone,
      address: formData.address,
      documents: uploadedUrls,
      role: 'eo',
      status: 'pending_verification',
      createdAt: serverTimestamp(),
    });

    // 4. Kirim Email Verifikasi
    await sendEmailVerification(user);

    return { success: true, user };

  } catch (error: any) {
    // Lempar error agar bisa ditangkap di UI
    throw new Error(error.message || "Terjadi kesalahan saat pendaftaran");
  }
};

/**
 * 1. GET EO STATS (Dashboard Cards)
 */
export const getEOStats = async (eoId: string) => {
  try {
    // Gunakan query sederhana dulu tanpa orderBy untuk hitung statistik
    // agar menghindari masalah Indexing yang belum dibuat
    const q = query(collection(db, "events"), where("eoId", "==", eoId));
    let snapshot = await getDocs(q);

    // Fallback support field lama 'organizerId'
    if (snapshot.empty) {
        const qLegacy = query(collection(db, "events"), where("organizerId", "==", eoId));
        snapshot = await getDocs(qLegacy);
    }

    const events = snapshot.docs.map(doc => doc.data());

    const totalEvents = events.length;
    const pendingEvents = events.filter(e => e.status === 'pending' || e.status === 'pending_review').length;
    
    // Note: Revenue & Sold dihitung ulang di frontend via transaction service
    // agar lebih akurat (sesuai perbaikan sebelumnya)
    
    return {
      totalEvents,
      ticketsSold: 0, // Placeholder, diupdate di UI
      totalRevenue: 0, // Placeholder, diupdate di UI
      pendingEvents
    };
  } catch (error) {
    console.error("Error fetching EO stats:", error);
    return { totalEvents: 0, ticketsSold: 0, totalRevenue: 0, pendingEvents: 0 };
  }
};

/**
 * 2. GET MY EVENTS (List Semua Event EO) [FIXED MERGE]
 * Mengambil data dari 'eoId' DAN 'organizerId' lalu digabung.
 */
export const getMyEvents = async (eoId: string): Promise<EventData[]> => {
  try {
    // 1. Ambil data dengan schema baru (eoId)
    const qNew = query(collection(db, "events"), where("eoId", "==", eoId));
    
    // 2. Ambil data dengan schema lama (organizerId)
    const qLegacy = query(collection(db, "events"), where("organizerId", "==", eoId));

    // Jalankan keduanya secara paralel
    const [snapNew, snapLegacy] = await Promise.all([
        getDocs(qNew),
        getDocs(qLegacy)
    ]);

    // 3. Gabungkan hasil & Hapus Duplikat (jika ada)
    // Kita pakai Map untuk memastikan ID unik
    const eventsMap = new Map();

    snapLegacy.docs.forEach(doc => {
        eventsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    snapNew.docs.forEach(doc => {
        eventsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Konversi Map kembali ke Array
    const events = Array.from(eventsMap.values()) as EventData[];

    // 4. Sort Manual (Client Side) - Terbaru di atas
    return events.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; 
    });

  } catch (error) {
    console.error("Error fetching my events:", error);
    return [];
  }
};
/**
 * 3. GET EO SALES REPORT (Raw Transaction Data)
 */
export const getEOSalesReport = async (eoId: string) => {
  try {
    // 1. Ambil ID Event milik EO
    const events = await getMyEvents(eoId);
    const eventIds = events.map(e => e.id);

    if (eventIds.length === 0) return [];

    // 2. Ambil Transaksi yang sukses
    const qTrans = query(
        collection(db, "transactions"),
        where("status", "in", ["settlement", "capture"]),
        orderBy("transactionTime", "desc")
    );
    const transSnap = await getDocs(qTrans);

    // 3. Filter milik EO ini
    const sales = transSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(t => eventIds.includes(t.eventId));

    return sales;

  } catch (error) {
    console.error("Error fetching sales report:", error);
    return [];
  }
};