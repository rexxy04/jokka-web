'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input';
import FileInput from '@/components/ui/FileInput';
import { getPlaceById, updatePlace, PlaceFormData } from '@/lib/services/admin';

export default function EditWisataPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [placeId, setPlaceId] = useState<string>("");
  
  // State Form
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    category: 'Alam',
    rating: '',
    description: '',
    location: '',
    price: ''
  });

  const [currentImage, setCurrentImage] = useState<string>(""); // Untuk preview gambar lama
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // 1. Fetch Data Lama saat Halaman Dibuka
  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params; // Next.js 15 butuh await params
      setPlaceId(resolvedParams.id);
      
      const data = await getPlaceById(resolvedParams.id);
      if (data) {
        setFormData({
          name: data.name,
          category: data.category,
          rating: data.rating,
          description: data.description,
          location: data.location || "",
          price: data.price || ""
        });
        setCurrentImage(data.image);
      } else {
        alert("Data tidak ditemukan!");
        router.push('/admin/manage-wisata');
      }
      setLoading(false);
    };
    init();
  }, [params, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setNewImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Panggil Service Update
      await updatePlace(placeId, formData, newImageFile);
      alert("Wisata Berhasil Diupdate! ✅");
      router.push('/admin/manage-wisata'); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/manage-wisata" className="text-gray-500 hover:text-gray-900">
          &larr; Batal
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Destinasi</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Input 
            label="Nama Tempat" 
            name="name" 
            value={formData.name}
            onChange={handleChange} 
            required 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                name="category" 
                value={formData.category}
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
              value={formData.rating}
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Lokasi Singkat" 
              name="location" 
              value={formData.location}
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Harga Tiket Masuk" 
              name="price" 
              value={formData.price}
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              onChange={handleChange}
              required
            />
          </div>

          {/* Preview Gambar Lama & Upload Baru */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-bold text-gray-500 mb-2">Foto Saat Ini:</p>
            <img src={currentImage} alt="Current" className="h-32 w-full object-cover rounded-lg mb-4" />
            
            <FileInput 
              label="Ganti Foto (Opsional - Biarkan kosong jika tidak ingin ganti)" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" className="px-8" disabled={submitting}>
              {submitting ? "Menyimpan Perubahan..." : "Update Data"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}