import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const loginService = async (email: string, password: string) => {
  try {
    // 1. Login ke Firebase Auth (Cek Email & Password)
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Cek Apakah Email Belum Diverifikasi?
    // (Opsional: Jika dosen mewajibkan verifikasi email sebelum login)
    if (!user.emailVerified) {
      // Kita logout lagi biar dia gak bisa masuk
      await signOut(auth);
      throw new Error("Email Anda belum diverifikasi. Silakan cek inbox email Anda.");
    }

    // 3. Cek Apakah Dia EO? (Cek ke collection 'eos')
    const eoDocRef = doc(db, 'eos', user.uid);
    const eoSnap = await getDoc(eoDocRef);

    if (eoSnap.exists()) {
      const eoData = eoSnap.data();
      
      // Cek Status EO
      if (eoData.status === 'pending_verification') {
        await signOut(auth); // Tendang keluar
        throw new Error("Akun EO Anda sedang direview oleh Admin. Mohon tunggu 1x24 jam.");
      }
      
      if (eoData.status === 'rejected') {
        await signOut(auth);
        throw new Error("Mohon maaf, pendaftaran EO Anda ditolak.");
      }

      // Jika Verified, return role EO
      return { user, role: 'eo' };
    }

    // 4. Cek Apakah Dia Admin? 
    // (Cara sederhana: Cek email khusus atau collection 'admins')
    // Untuk tugas ini, kita anggap email tertentu adalah admin
    if (email === 'admin@jokka.com') { 
       return { user, role: 'admin' };
    }

    // 5. Jika bukan EO dan bukan Admin, berarti USER BIASA
    return { user, role: 'user' };

  } catch (error: any) {
    // Parsing error message dari Firebase biar enak dibaca user
    let message = error.message;
    if (error.code === 'auth/invalid-credential') message = "Email atau password salah.";
    if (error.code === 'auth/user-not-found') message = "Akun tidak ditemukan.";
    if (error.code === 'auth/wrong-password') message = "Password salah.";
    
    throw new Error(message);
  }
};