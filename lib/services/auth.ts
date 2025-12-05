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
// 1. SERVICE LOGIN (Smart Login Logic - DYNAMIC)
// ==========================================
export const loginService = async (email: string, password: string) => {
  try {
    // A. Login ke Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // B. Cek Verifikasi Email
    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("Email Anda belum diverifikasi. Silakan cek inbox email Anda.");
    }

    // C. CEK DI COLLECTION 'EOS' (Apakah dia EO?)
    const eoDocRef = doc(db, 'eos', user.uid);
    const eoSnap = await getDoc(eoDocRef);

    if (eoSnap.exists()) {
      const eoData = eoSnap.data();
      
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

    // D. CEK DI COLLECTION 'USERS' (Admin atau User Biasa?)
    // --- LOGIC DINAMIS: Cek field 'role' di database ---
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // Jika di database role-nya 'admin', maka login sebagai admin
      if (userData.role === 'admin') {
        return { user, role: 'admin' };
      }
      
      // Jika role-nya 'user' atau lainnya
      return { user, role: 'user' };
    }

    // Fallback (Default User)
    return { user, role: 'user' };

  } catch (error: any) {
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
export const registerUserService = async (formData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    );
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: formData.fullname
    });

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullname: formData.fullname,
      username: formData.username,
      email: formData.email,
      role: 'user', // Default user biasa
      createdAt: serverTimestamp(),
    });

    await sendEmailVerification(user);

    return { success: true, user };

  } catch (error: any) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') message = "Email sudah terdaftar.";
    if (error.code === 'auth/weak-password') message = "Password terlalu lemah (min. 6 karakter).";
    
    throw new Error(message);
  }
};

// ==========================================
// 3. GET USER PROFILE (Untuk Layout Protection)
// ==========================================
export const getUserProfile = async (uid: string) => {
  try {
    // Cek EO
    const eoSnap = await getDoc(doc(db, "eos", uid));
    if (eoSnap.exists()) return eoSnap.data();

    // Cek User/Admin
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) return userSnap.data();

    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};