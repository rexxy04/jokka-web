'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '@/lib/services/auth'; 
import { createEvent, EventFormData, TicketData } from '@/lib/services/event';

// Import UI Components
import Input from '@/components/ui/input'; 
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';
import LocationPicker from '@/components/ui/LocationPicker';
// 1. Import StatusModal
import StatusModal from '@/components/ui/StatusModal';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [eoProfile, setEoProfile] = useState<any>(null);

  // 2. State untuk Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, message: string, type: 'success' | 'error'}>({ title: '', message: '', type: 'success' });
  const [isSuccess, setIsSuccess] = useState(false); // Penanda redirect

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

  // Array Tiket
  const [tickets, setTickets] = useState<TicketData[]>([
    { name: 'Regular', price: 0, stock: 100 }
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
  const handleTicketChange = (index: number, field: keyof TicketData, value: string) => {
    const newTickets = [...tickets];
    // @ts-ignore
    newTickets[index][field] = value;
    setTickets(newTickets);
  };

  const addTicketVariant = () => {
    setTickets([...tickets, { name: '', price: 0, stock: 50 }]);
  };

  const removeTicketVariant = (index: number) => {
    // Ganti Alert Validation
    if (tickets.length === 1) {
        setModalContent({
            title: "Tidak Bisa Hapus",
            message: "Minimal harus ada 1 jenis tiket dalam sebuah event.",
            type: 'error'
        });
        setIsSuccess(false);
        setShowModal(true);
        return;
    }
    const newTickets = tickets.filter((_, i) => i !== index);
    setTickets(newTickets);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Status EO (Ganti Alert)
    if (eoProfile?.status !== 'verified') {
      setModalContent({
        title: "Akses Dibatasi",
        message: "Akun Anda belum diverifikasi oleh Admin. Anda belum bisa membuat event.",
        type: 'error'
      });
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    // Validasi Poster (Ganti Alert)
    if (!poster) {
        setModalContent({ title: "Poster Wajib", message: "Mohon upload poster event Anda agar terlihat menarik!", type: 'error' });
        setIsSuccess(false);
        setShowModal(true);
        return;
    }

    // Validasi Lokasi (Ganti Alert)
    if (!formData.locationName) {
        setModalContent({ title: "Lokasi Kosong", message: "Silakan pilih lokasi event melalui peta.", type: 'error' });
        setIsSuccess(false);
        setShowModal(true);
        return;
    }
    
    // Validasi Tiket
    const isTicketValid = tickets.every(t => t.name && t.stock > 0);
    if (!isTicketValid) {
        setModalContent({ title: "Data Tiket Belum Lengkap", message: "Pastikan nama tiket terisi dan stok minimal 1.", type: 'error' });
        setIsSuccess(false);
        setShowModal(true);
        return;
    }

    setLoading(true);
    try {
      const finalData: EventFormData = {
        ...formData,
        tickets: tickets
      };

      await createEvent(finalData, poster, user.uid);
      
      // SUKSES (Ganti Alert)
      setModalContent({
        title: "Event Berhasil Dibuat! 🎉",
        message: "Event Anda telah tersimpan dan sedang menunggu persetujuan Admin untuk tayang.",
        type: 'success'
      });
      setIsSuccess(true); // Set true agar redirect saat close
      setShowModal(true);

    } catch (error: any) {
      // ERROR (Ganti Alert)
      setModalContent({
        title: "Gagal Membuat Event",
        message: error.message || "Terjadi kesalahan sistem.",
        type: 'error'
      });
      setIsSuccess(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Handler Tutup Modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Redirect hanya jika sukses create event
    if (isSuccess) {
        router.push('/eo/my-events');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* JUDUL HALAMAN (Putih agar kontras dengan dashboard gelap) */}
      <h1 className="text-2xl font-bold text-white mb-6">Buat Event Baru 🎉</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* SECTION 1: DETAIL EVENT */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">Detail Acara</h3>
          
          {/* Label manual dengan text-gray-900 agar hitam pekat */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Nama Event</label>
            <Input name="title" placeholder="Contoh: Konser Galau 2025" onChange={handleChange} required className="text-gray-900" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Kategori</label>
              <select name="category" onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                <option value="Musik">Musik</option>
                <option value="Festival">Festival</option>
                <option value="Workshop">Workshop</option>
                <option value="Pameran">Pameran</option>
                <option value="Olahraga">Olahraga</option>
              </select>
            </div>
            
            <div>
               <label className="block text-xs font-medium text-gray-900 mb-1">Lokasi (Pilih di Peta Bawah)</label>
               <input className="w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 text-gray-900 cursor-not-allowed" value={formData.locationName} readOnly placeholder="Pilih lokasi di peta..." />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-xs font-bold text-blue-900 mb-2">Cari Lokasi Event</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Waktu Mulai</label>
                <Input name="startDate" type="datetime-local" onChange={handleChange} required className="text-gray-900" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Waktu Selesai</label>
                <Input name="endDate" type="datetime-local" onChange={handleChange} required className="text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Deskripsi Lengkap</label>
            <textarea name="description" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Jelaskan detail acara..." onChange={handleChange} required />
          </div>

          <FileInput label="Upload Poster Event (Wajib)" accept="image/*" onChange={handleFileChange} required />
        </section>

        {/* SECTION 2: VARIASI TIKET */}
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
                  {index === 0 && <label className="block text-xs font-medium text-gray-900 mb-1">Nama Tiket (cth: VIP)</label>}
                  <Input 
                    placeholder="Nama Tiket" 
                    value={ticket.name} 
                    onChange={(e) => handleTicketChange(index, 'name', e.target.value)} 
                    required 
                    className="text-gray-900 bg-white"
                  />
                </div>
                
                {/* Harga */}
                <div className="w-full md:w-1/3">
                  {index === 0 && <label className="block text-xs font-medium text-gray-900 mb-1">Harga (Rp)</label>}
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={ticket.price.toString()} 
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)} 
                    required 
                    className="text-gray-900 bg-white"
                  />
                </div>
                
                {/* Stok */}
                <div className="w-full md:w-1/4">
                  {index === 0 && <label className="block text-xs font-medium text-gray-900 mb-1">Kuota</label>}
                  <Input 
                    type="number" 
                    placeholder="100" 
                    value={ticket.stock.toString()} 
                    onChange={(e) => handleTicketChange(index, 'stock', e.target.value)} 
                    required 
                    className="text-gray-900 bg-white"
                  />
                </div>

                {/* Tombol Hapus */}
                {tickets.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTicketVariant(index)}
                    className="md:mb-1 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                    title="Hapus varian ini"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic">*Tiket dengan harga 0 akan dianggap Gratis.</p>
        </section>

        {/* SUBMIT */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Sedang Upload..." : "Simpan & Ajukan Event"}
          </Button>
        </div>

      </form>

      {/* 3. Render Modal */}
      <StatusModal 
        isOpen={showModal} 
        onClose={handleCloseModal} // Menggunakan handler khusus
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
}