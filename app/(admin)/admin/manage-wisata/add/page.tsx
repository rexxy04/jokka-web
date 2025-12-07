'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input';
import FileInput from '@/components/ui/FileInput';
// Import Component Peta (Reusable)
import LocationPicker from '@/components/ui/LocationPicker'; 
// Import Service
import { addPlace, PlaceFormData } from '@/lib/services/admin';
// Import Modal Notifikasi
import StatusModal from '@/components/ui/StatusModal';

export default function AddWisataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form (Ditambah lat & lng)
  const [formData, setFormData] = useState<PlaceFormData & { lat: number; lng: number }>({
    name: '',
    category: 'Alam',
    rating: '',
    description: '',
    location: '',
    price: '',
    lat: 0, // Default
    lng: 0  // Default
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler saat Lokasi Dipilih di Peta
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({ 
        ...prev, 
        lat, 
        lng, 
        location: address // Otomatis isi nama lokasi dari Google Maps juga
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Foto
    if (!imageFile) {
        setModalContent({ title: "Foto Diperlukan", message: "Wajib upload foto wisata agar tampilan menarik!" });
        setIsSuccess(false);
        setShowModal(true);
        return;
    }

    // Validasi Peta
    if (formData.lat === 0 || formData.lng === 0) {
        setModalContent({ title: "Lokasi Peta Kosong", message: "Silakan pilih titik lokasi wisata di peta." });
        setIsSuccess(false);
        setShowModal(true);
        return;
    }

    setLoading(true);
    try {
      // Kirim data ke service (Pastikan service addPlace menerima lat/lng)
      await addPlace(formData, imageFile);
      
      setModalContent({
        title: "Berhasil Disimpan! 🏖️",
        message: "Destinasi wisata baru berhasil ditambahkan ke database."
      });
      setIsSuccess(true);
      setShowModal(true);
      
    } catch (error: any) {
      setModalContent({ title: "Gagal Menyimpan", message: error.message || "Terjadi kesalahan." });
      setIsSuccess(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess) router.push('/admin/manage-wisata');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/manage-wisata" className="text-gray-500 hover:text-gray-900">
          &larr; Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Destinasi Baru</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Baris 1: Nama */}
          <Input 
            label="Nama Tempat" 
            name="name" 
            placeholder="Contoh: Pantai Losari" 
            value={formData.name}
            onChange={handleChange} 
            required 
          />

          {/* Baris 2: Kategori & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                name="category" 
                onChange={handleChange}
                value={formData.category}
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
              value={formData.rating}
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Baris 3: Lokasi Manual & Peta */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
             <div className="flex justify-between items-center">
                 <h3 className="font-bold text-blue-900 text-sm">📍 Tentukan Lokasi</h3>
                 <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Wajib</span>
             </div>
             
             {/* Component LocationPicker (Map) */}
             <div className="overflow-hidden rounded-lg border border-blue-200">
                <LocationPicker onLocationSelect={handleLocationSelect} />
             </div>

             <Input 
                label="Alamat / Lokasi (Otomatis dari Peta)" 
                name="location" 
                placeholder="Pilih lokasi di peta di atas..." 
                value={formData.location} // Terisi otomatis dari peta
                onChange={handleChange} 
                required 
                readOnly // Supaya user pilih dari peta saja agar akurat
                className="bg-gray-50 cursor-not-allowed"
             />
          </div>

          {/* Baris 4: Harga & Deskripsi */}
          <Input 
             label="Harga Tiket Masuk" 
             name="price" 
             placeholder="Gratis / Rp 10.000" 
             value={formData.price}
             onChange={handleChange} 
             required 
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea
              name="description"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Jelaskan keunikan tempat ini..."
              value={formData.description}
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
              {loading ? "Menyimpan..." : "Simpan Destinasi"}
            </Button>
          </div>

        </form>
      </div>

      <StatusModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
}