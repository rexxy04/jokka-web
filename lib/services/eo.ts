import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, query, where, collection, getDocs } from 'firebase/firestore';
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

// --- SERVICE: AMBIL EVENT MILIK EO ---
export const getMyEvents = async (eoId: string) => {
  try {
    // Ambil event dimana organizerId == eoId
    const q = query(collection(db, "events"), where("organizerId", "==", eoId));
    const querySnapshot = await getDocs(q);

    const events: any[] = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    // Sort manual di client (Biar gak perlu bikin index Firestore dulu)
    // Urutkan dari yang paling baru dibuat
    return events.sort((a, b) => b.createdAt - a.createdAt);

  } catch (error) {
    console.error("Error fetching my events:", error);
    return [];
  }
};

// --- SERVICE DASHBOARD STATS ---
export const getEOStats = async (eoId: string) => {
  try {
    // Ambil semua event milik EO ini
    const q = query(collection(db, "events"), where("organizerId", "==", eoId));
    const querySnapshot = await getDocs(q);

    let totalEvents = 0;
    let ticketsSold = 0;
    let totalRevenue = 0;
    let pendingEvents = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalEvents++;

      // Hitung Tiket Terjual & Pendapatan dari data Event
      if (data.tickets && data.tickets.length > 0) {
        const sold = data.tickets[0].sold || 0;
        const price = data.tickets[0].price || 0;
        
        ticketsSold += sold;
        totalRevenue += (sold * price);
      }

      // Hitung Event yang masih Pending Review
      if (data.status === 'pending_review') {
        pendingEvents++;
      }
    });

    return {
      totalEvents,
      ticketsSold,
      totalRevenue,
      pendingEvents
    };

  } catch (error) {
    console.error("Error fetching EO stats:", error);
    return { totalEvents: 0, ticketsSold: 0, totalRevenue: 0, pendingEvents: 0 };
  }
};