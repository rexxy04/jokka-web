'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '@/lib/services/auth'; // <--- Import Logic Cek Profil
import { createEvent, EventFormData } from '@/lib/services/event';

// Import UI Components
import Input from '@/components/ui/input'; 
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [eoProfile, setEoProfile] = useState<any>(null); // State simpan profil EO

  // Cek User Login & Ambil Profil
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Ambil data profil dari Firestore untuk cek status 'verified'
        const profile = await getUserProfile(currentUser.uid);
        setEoProfile(profile);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // State Form
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: 'Musik',
    locationName: '',
    startDate: '',
    endDate: '',
    ticketName: 'Regular',
    ticketPrice: 0,
    ticketStock: 100,
  });

  const [poster, setPoster] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPoster(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. CEK STATUS EO (KEAMANAN)
    if (eoProfile?.status !== 'verified') {
      alert("⚠️ AKSES DITOLAK\n\nAkun Anda belum diverifikasi oleh Admin.\nAnda belum bisa membuat event.");
      return;
    }

    // 2. Validasi Input
    if (!poster) return alert("Wajib upload poster event!");
    if (!user) return alert("Sesi habis, silakan login ulang.");

    setLoading(true);
    try {
      // 3. Panggil Service Create Event
      await createEvent(formData, poster, user.uid);
      
      alert("Event berhasil dibuat! Menunggu persetujuan Admin.");
      router.push('/eo/my-events'); // Redirect ke list event
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Event Baru 🎉</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* SECTION 1: DETAIL EVENT */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">Detail Acara</h3>
          
          <Input label="Nama Event" name="title" placeholder="Contoh: Konser Galau 2025" onChange={handleChange} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                name="category" 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Musik">Musik</option>
                <option value="Festival">Festival</option>
                <option value="Workshop">Workshop</option>
                <option value="Pameran">Pameran</option>
                <option value="Olahraga">Olahraga</option>
              </select>
            </div>
            <Input label="Lokasi (Venue)" name="locationName" placeholder="Gedung / Lapangan..." onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Waktu Mulai" name="startDate" type="datetime-local" onChange={handleChange} required />
            <Input label="Waktu Selesai" name="endDate" type="datetime-local" onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea 
              name="description" 
              rows={4} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jelaskan detail acara..."
              onChange={handleChange}
              required
            />
          </div>

          <FileInput label="Upload Poster Event (Wajib)" accept="image/*" onChange={handleFileChange} required />
        </section>

        {/* SECTION 2: TIKET */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">Info Tiket</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nama Tiket" name="ticketName" value={formData.ticketName} onChange={handleChange} required />
            <Input label="Harga (Rp)" name="ticketPrice" type="number" onChange={handleChange} required />
            <Input label="Stok / Kuota" name="ticketStock" type="number" value={formData.ticketStock} onChange={handleChange} required />
          </div>
        </section>

        {/* SUBMIT */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Sedang Upload..." : "Simpan & Ajukan Event"}
          </Button>
        </div>

      </form>
    </div>
  );
}