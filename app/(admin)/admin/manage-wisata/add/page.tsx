'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input';
import FileInput from '@/components/ui/FileInput';
// Import Service
import { addPlace, PlaceFormData } from '@/lib/services/admin';

export default function AddWisataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    category: 'Alam',
    rating: '',
    description: '',
    location: '',
    price: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Wajib upload foto wisata!");

    setLoading(true);
    try {
      await addPlace(formData, imageFile);
      alert("Wisata Berhasil Ditambahkan! 🏖️");
      router.push('/admin/manage-wisata'); // Balik ke tabel
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/manage-wisata" className="text-gray-500 hover:text-gray-900">
          &larr; Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Destinasi Baru</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Baris 1 */}
          <Input 
            label="Nama Tempat" 
            name="name" 
            placeholder="Contoh: Pantai Losari" 
            onChange={handleChange} 
            required 
          />

          {/* Baris 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                name="category" 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="Alam">Alam</option>
                <option value="Kuliner">Kuliner</option>
                <option value="Sejarah">Sejarah</option>
                <option value="Religi">Religi</option>
                <option value="Rekreasi">Rekreasi</option>
                <option value="Belanja">Belanja</option>
              </select>
            </div>
            <Input 
              label="Rating (0-5)" 
              name="rating" 
              type="number" 
              step="0.1" 
              placeholder="4.8" 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Baris 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Lokasi Singkat" 
              name="location" 
              placeholder="Makassar, Indonesia" 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Harga Tiket Masuk" 
              name="price" 
              placeholder="Gratis / Rp 10.000" 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea
              name="description"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Jelaskan keunikan tempat ini..."
              onChange={handleChange}
              required
            />
          </div>

          {/* Upload Foto */}
          <FileInput 
            label="Foto Utama (Cover)" 
            accept="image/*" 
            onChange={handleFileChange} 
            required 
          />

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" className="px-8" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}