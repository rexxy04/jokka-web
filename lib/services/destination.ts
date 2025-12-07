import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  getDoc,
  doc
} from 'firebase/firestore'; 
import { db } from '@/lib/firebase';

export interface DestinationData {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: string | number;
  rating: string | number;
  image: string; // URL gambar utama
  // ... field lain sesuai kebutuhan
}

/**
 * GET FEATURED DESTINATIONS
 * Mengambil beberapa destinasi untuk ditampilkan di Homepage.
 * Bisa diurutkan berdasarkan rating atau tanggal dibuat.
 */
export const getFeaturedDestinations = async (count: number = 4): Promise<DestinationData[]> => {
  try {
    // Ambil dari collection 'places' (sesuai nama di admin sebelumnya)
    const q = query(
      collection(db, "places"),
      orderBy("rating", "desc"), // Urutkan berdasarkan rating tertinggi
      limit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DestinationData));
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return [];
  }
};

/**
 * GET ALL DESTINATIONS (Untuk halaman /destinasi nanti)
 */
export const getAllDestinations = async (): Promise<DestinationData[]> => {
  try {
    const q = query(collection(db, "places"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DestinationData));
  } catch (error) {
    console.error("Error fetching all destinations:", error);
    return [];
  }
};

/**
 * GET DESTINATION BY ID (Untuk detail page)
 */
export const getDestinationById = async (id: string): Promise<DestinationData | null> => {
  try {
    const docRef = doc(db, "places", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DestinationData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching destination detail:", error);
    return null;
  }
};