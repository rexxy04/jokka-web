'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '@/components/layout/Navbar'; // Biar tetap ada navigasi
import Input from '@/components/ui/input'; // Reusable component kita
import Button from '@/components/ui/Button';

export default function TambahWisataPage() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State untuk menampung data form
  const [formData, setFormData] = useState({
    name: '',
    category: 'Alam', // Default value
    rating: '',
    description: '',
    location: '',
    price: '',
    isFeatured: false
  });

  // Handle perubahan input teks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle perubahan checkbox (isFeatured)
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isFeatured: e.target.checked }));
  };

  // Handle pemilihan file gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // --- LOGIC UTAMA: UPLOAD & SAVE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert("Wajib upload gambar dulu ya!");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Gambar ke Firebase Storage
      // Nama file kita buat unik pakai Date.now() biar gak bentrok
      const storageRef = ref(storage, `jokka/places/${Date.now()}-${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      
      // 2. Ambil URL Download gambar yang barusan diupload
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 3. Simpan Data Lengkap ke Firestore
      await addDoc(collection(db, "places"), {
        name: formData.name,
        category: formData.category,
        rating: formData.rating,
        description: formData.description,
        location: formData.location,
        price: formData.price,
        isFeatured: formData.isFeatured,
        image: downloadURL, // URL dari Storage
        createdAt: new Date() // Opsional: catat kapan dibuat
      });

      alert("Berhasil! Data wisata sudah masuk ke database.");
      
      // Reset Form
      setFormData({
        name: '', category: 'Alam', rating: '', description: '', 
        location: '', price: '', isFeatured: false
      });
      setImageFile(null);

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Gagal menyimpan data. Cek console untuk detail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Wisata Baru 📝</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nama Tempat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Tempat</label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Contoh: Pantai Losari" required />
            </div>

            {/* Kategori & Rating (Grid 2 Kolom) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Alam">Alam</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Sejarah">Sejarah</option>
                  <option value="Religi">Religi</option>
                  <option value="Rekreasi">Rekreasi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                <Input name="rating" type="number" step="0.1" value={formData.rating} onChange={handleChange} placeholder="4.8" required />
              </div>
            </div>

            {/* Lokasi & Harga */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi (Singkat)</label>
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="Makassar, Indonesia" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harga Tiket</label>
                <Input name="price" value={formData.price} onChange={handleChange} placeholder="Gratis / Rp 10.000" />
              </div>
            </div>

            {/* Deskripsi (Textarea manual karena Input component kita cuma input biasa) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Lengkap</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jelaskan tentang tempat ini..."
                required
              />
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto Utama</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Checkbox Featured */}
            <div className="flex items-center">
              <input
                id="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={handleCheckbox}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                Jadikan Pilihan Utama (Featured)?
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
              {loading ? "Sedang Upload..." : "Simpan Data"}
            </Button>

          </form>
        </div>
      </div>
    </main>
  );
}