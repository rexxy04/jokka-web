import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// ==========================================
// 1. SERVICE LOGIN (Smart Login Logic)
// ==========================================
// Fungsi ini menangani login dan pengecekan Role (User/EO/Admin)
export const loginService = async (email: string, password: string) => {
  try {
    // A. Login ke Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // B. Cek Verifikasi Email (Opsional, tapi disarankan untuk keamanan)
    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("Email Anda belum diverifikasi. Silakan cek inbox email Anda.");
    }

    // C. Cek Apakah Dia EO? (Cek ke collection 'eos')
    const eoDocRef = doc(db, 'eos', user.uid);
    const eoSnap = await getDoc(eoDocRef);

    if (eoSnap.exists()) {
      const eoData = eoSnap.data();
      
      // Cek Status EO
      if (eoData.status === 'pending_verification') {
        await signOut(auth);
        throw new Error("Akun EO Anda sedang direview oleh Admin. Mohon tunggu 1x24 jam.");
      }
      
      if (eoData.status === 'rejected') {
        await signOut(auth);
        throw new Error("Mohon maaf, pendaftaran EO Anda ditolak.");
      }

      // Jika Verified, return role EO
      return { user, role: 'eo' };
    }

    // D. Cek Apakah Dia Admin? 
    // (Logic sederhana: Hardcode email admin. Untuk production bisa pakai custom claims atau collection admin)
    if (email === 'admin@jokka.com') { 
       return { user, role: 'admin' };
    }

    // E. Jika bukan EO dan bukan Admin, berarti USER BIASA
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

// ==========================================
// 2. SERVICE REGISTER USER BIASA
// ==========================================
// Fungsi ini khusus untuk pendaftaran pengunjung biasa (bukan EO)
export const registerUserService = async (formData: any) => {
  try {
    // A. Buat user di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    );
    const user = userCredential.user;

    // B. Update Nama Display di Auth (agar muncul di Navbar nanti)
    await updateProfile(user, {
      displayName: formData.fullname
    });

    // C. Simpan data user ke Firestore (Collection 'users')
    // Kita pisahkan: User Biasa -> 'users', EO -> 'eos'
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullname: formData.fullname,
      username: formData.username,
      email: formData.email,
      role: 'user',
      createdAt: serverTimestamp(),
    });

    // D. Kirim Email Verifikasi
    await sendEmailVerification(user);

    return { success: true, user };

  } catch (error: any) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') message = "Email sudah terdaftar.";
    if (error.code === 'auth/weak-password') message = "Password terlalu lemah (min. 6 karakter).";
    
    throw new Error(message);
  }
};