import { auth, db } from '@/lib/firebase';
import { storage } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword, 
  sendPasswordResetEmail,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


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


// ==========================================
// 4. UPDATE USER PROFILE
// ==========================================

export const updateUserData = async (uid: string, data: { phone: string }) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      phone: data.phone
    });
    return { success: true };
  } catch (error: any) {
    throw new Error("Gagal mengupdate profil.");
  }
};

// 5. GANTI PASSWORD (Dengan Re-autentikasi)
export const changeUserPassword = async (user: User, currentPass: string, newPass: string) => {
  try {
    if (!user.email) throw new Error("Email tidak valid");

    // A. Re-autentikasi (Cek password lama dulu)
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credential);

    // B. Update Password
    await updatePassword(user, newPass);
    
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Password saat ini salah.");
    }
    if (error.code === 'auth/weak-password') {
      throw new Error("Password baru terlalu lemah (min. 6 karakter).");
    }
    throw new Error("Gagal mengganti password. Coba login ulang.");
  }
};

// 6. RESET PASSWORD (Lupa Password)
export const sendResetPasswordLink = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    throw new Error("Gagal mengirim link reset password.");
  }
};


// 7. UPLOAD PROFILE PICTURE
export const updateUserProfileImage = async (user: any, file: File) => {
  try {
    // 1. Upload Foto ke Storage
    // Path: profile_images/{uid} (Kita timpa file lama biar hemat storage)
    const storageRef = ref(storage, `profile_images/${user.uid}`);
    const snapshot = await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(snapshot.ref);

    // 2. Update Profile Auth (Biar muncul di Navbar/Profile)
    await updateProfile(user, {
      photoURL: photoURL
    });

    // 3. Update juga di Firestore 'users' (Opsional, buat backup data)
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      photoURL: photoURL
    });

    return { success: true, photoURL };

  } catch (error: any) {
    console.error("Error updating profile image:", error);
    throw new Error("Gagal mengupload foto profil.");
  }
};

/**
 * FUNGSI BARU: LOGIN WITH GOOGLE
 * Menangani login & register sekaligus via Google
 */
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    
    // 1. Munculkan Popup Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 2. Cek apakah user ini sudah punya data di Firestore?
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    let role = 'user'; // Default role

    if (!docSnap.exists()) {
      // 3. JIKA USER BARU: Buat dokumen di Firestore
      await setDoc(docRef, {
        uid: user.uid,
        fullname: user.displayName || "User Google",
        username: user.email?.split('@')[0] || "user", // Generate username dari email
        email: user.email,
        role: 'user', // Default jadi user biasa
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL || "",
        phone: "",
        status: 'verified' // Google user otomatis verified
      });
    } else {
      // 4. JIKA USER LAMA: Ambil role yang sudah ada
      const data = docSnap.data();
      role = data.role;
    }

    // Kembalikan data user & role untuk redirect di frontend
    return { user, role };

  } catch (error: any) {
    console.error("Google Login Error:", error);
    throw new Error("Gagal login dengan Google. Coba lagi.");
  }
};