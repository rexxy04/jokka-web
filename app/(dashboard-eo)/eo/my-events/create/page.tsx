'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '@/lib/services/auth'; 
import { createEvent, EventFormData, TicketData } from '@/lib/services/event'; // Import type baru

// Import UI Components
import Input from '@/components/ui/input'; 
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';
import LocationPicker from '@/components/ui/LocationPicker';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [eoProfile, setEoProfile] = useState<any>(null);

  // Cek Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profile = await getUserProfile(currentUser.uid);
        setEoProfile(profile);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // State Form Utama
  const [formData, setFormData] = useState<Omit<EventFormData, 'tickets'>>({
    title: '',
    description: '',
    category: 'Musik',
    locationName: '', 
    lat: 0, 
    lng: 0,
    startDate: '',
    endDate: '',
  });

  // STATE BARU: Array Tiket
  const [tickets, setTickets] = useState<TicketData[]>([
    { name: 'Regular', price: 0, stock: 100 } // Default 1 tiket
  ]);

  const [poster, setPoster] = useState<File | null>(null);

  // --- HANDLERS FORM UTAMA ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPoster(e.target.files[0]);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({ ...prev, lat, lng, locationName: address }));
  };

  // --- HANDLERS KHUSUS TIKET ---
  
  // 1. Ubah data tiket tertentu berdasarkan index
  const handleTicketChange = (index: number, field: keyof TicketData, value: string) => {
    const newTickets = [...tickets];
    // @ts-ignore
    newTickets[index][field] = value;
    setTickets(newTickets);
  };

  // 2. Tambah baris tiket baru
  const addTicketVariant = () => {
    setTickets([...tickets, { name: '', price: 0, stock: 50 }]);
  };

  // 3. Hapus baris tiket
  const removeTicketVariant = (index: number) => {
    if (tickets.length === 1) return alert("Minimal harus ada 1 jenis tiket!");
    const newTickets = tickets.filter((_, i) => i !== index);
    setTickets(newTickets);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (eoProfile?.status !== 'verified') {
      alert("⚠️ AKSES DITOLAK\n\nAkun belum diverifikasi Admin.");
      return;
    }

    if (!poster) return alert("Wajib upload poster event!");
    if (!formData.locationName) return alert("Wajib pilih lokasi!");
    
    // Validasi Tiket
    const isTicketValid = tickets.every(t => t.name && t.stock > 0);
    if (!isTicketValid) return alert("Pastikan semua data tiket (Nama & Stok) terisi!");

    setLoading(true);
    try {
      // Gabungkan data form + array tiket
      const finalData: EventFormData = {
        ...formData,
        tickets: tickets
      };

      await createEvent(finalData, poster, user.uid);
      
      alert("Event berhasil dibuat! Menunggu persetujuan Admin.");
      router.push('/eo/my-events');
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
        
        {/* SECTION 1: DETAIL EVENT (SAMA SEPERTI SEBELUMNYA) */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">Detail Acara</h3>
          
          <Input label="Nama Event" name="title" placeholder="Contoh: Konser Galau 2025" onChange={handleChange} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select name="category" onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Musik">Musik</option>
                <option value="Festival">Festival</option>
                <option value="Workshop">Workshop</option>
                <option value="Pameran">Pameran</option>
                <option value="Olahraga">Olahraga</option>
              </select>
            </div>
            
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Lokasi (Pilih di Peta Bawah)</label>
               <input className="w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed" value={formData.locationName} readOnly placeholder="Pilih lokasi di peta..." />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-xs font-bold text-blue-800 mb-2">Cari Lokasi Event</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Waktu Mulai" name="startDate" type="datetime-local" onChange={handleChange} required />
            <Input label="Waktu Selesai" name="endDate" type="datetime-local" onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea name="description" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jelaskan detail acara..." onChange={handleChange} required />
          </div>

          <FileInput label="Upload Poster Event (Wajib)" accept="image/*" onChange={handleFileChange} required />
        </section>

        {/* SECTION 2: VARIASI TIKET (FITUR BARU) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Variasi Tiket</h3>
            <button type="button" onClick={addTicketVariant} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 transition">
              + Tambah Varian
            </button>
          </div>
          
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                {/* Nama Tiket */}
                <div className="flex-1 w-full">
                  <Input 
                    label={index === 0 ? "Nama Tiket (cth: VIP)" : ""} 
                    placeholder="Nama Tiket" 
                    value={ticket.name} 
                    onChange={(e) => handleTicketChange(index, 'name', e.target.value)} 
                    required 
                  />
                </div>
                
                {/* Harga */}
                <div className="w-full md:w-1/3">
                  <Input 
                    label={index === 0 ? "Harga (Rp)" : ""} 
                    type="number" 
                    placeholder="0" 
                    value={ticket.price.toString()} 
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)} 
                    required 
                  />
                </div>
                
                {/* Stok */}
                <div className="w-full md:w-1/4">
                  <Input 
                    label={index === 0 ? "Kuota" : ""} 
                    type="number" 
                    placeholder="100" 
                    value={ticket.stock.toString()} 
                    onChange={(e) => handleTicketChange(index, 'stock', e.target.value)} 
                    required 
                  />
                </div>

                {/* Tombol Hapus (Hanya muncul jika tiket > 1) */}
                {tickets.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTicketVariant(index)}
                    className="md:mb-3 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                    title="Hapus varian ini"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 italic">*Tiket dengan harga 0 akan dianggap Gratis.</p>
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