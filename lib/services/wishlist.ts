import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc
} from 'firebase/firestore';

export interface WishlistItem {
  id: string; // ID Dokumen Wishlist
  userId: string;
  itemId: string; // ID Event atau ID Wisata
  itemType: 'event' | 'place';
  title: string;
  image: string;
  category: string;
  location: string;
  createdAt: any;
}

// 1. Toggle Wishlist (Kalau belum ada -> Simpan, Kalau sudah -> Hapus)
export const toggleWishlist = async (userId: string, itemData: any) => {
  try {
    // Cek dulu apakah item ini sudah ada di wishlist user
    const q = query(
      collection(db, "wishlists"),
      where("userId", "==", userId),
      where("itemId", "==", itemData.id)
    );
    
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // JIKA SUDAH ADA -> HAPUS (Unlove)
      const docId = snapshot.docs[0].id;
      await deleteDoc(doc(db, "wishlists", docId));
      return { isLoved: false, message: "Dihapus dari Wishlist" };
    } else {
      // JIKA BELUM ADA -> TAMBAH (Love)
      await addDoc(collection(db, "wishlists"), {
        userId: userId,
        itemId: itemData.id,
        itemType: itemData.type, // 'event' atau 'place'
        title: itemData.title,
        image: itemData.image,
        category: itemData.category,
        location: itemData.location,
        createdAt: serverTimestamp()
      });
      return { isLoved: true, message: "Ditambahkan ke Wishlist ❤️" };
    }

  } catch (error) {
    console.error("Error toggle wishlist:", error);
    throw new Error("Gagal mengupdate wishlist");
  }
};

// 2. Cek Status Love (Untuk warna tombol awal)
export const checkIsLoved = async (userId: string, itemId: string) => {
  try {
    const q = query(
      collection(db, "wishlists"),
      where("userId", "==", userId),
      where("itemId", "==", itemId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty; // True jika ada, False jika kosong
  } catch (error) {
    return false;
  }
};

// 3. Ambil Semua Wishlist User
export const getUserWishlist = async (userId: string) => {
  try {
    const q = query(
      collection(db, "wishlists"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    // Mapping data
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as WishlistItem[];
  } catch (error) {
    return [];
  }
};