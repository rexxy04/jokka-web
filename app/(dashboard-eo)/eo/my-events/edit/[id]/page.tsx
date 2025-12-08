'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams untuk ambil ID
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
// Import Service
import { getEventById, updateEvent, EventFormData, TicketData } from '@/lib/services/event';

// Import UI
import Input from '@/components/ui/input'; 
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';
import LocationPicker from '@/components/ui/LocationPicker';
import StatusModal from '@/components/ui/StatusModal';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string; // Ambil ID dari URL

  const [loading, setLoading] = useState(true); // Loading awal fetch data
  const [submitting, setSubmitting] = useState(false); // Loading saat save
  
  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, message: string, type: 'success' | 'error'}>({ title: '', message: '', type: 'success' });
  const [isSuccess, setIsSuccess] = useState(false);

  // State Form
  const [formData, setFormData] = useState<Omit<EventFormData, 'tickets'>>({
    title: '', description: '', category: 'Musik', locationName: '', lat: 0, lng: 0, startDate: '', endDate: '',
  });
  const [tickets, setTickets] = useState<TicketData[]>([{ name: 'Regular', price: 0, stock: 100 }]);
  const [poster, setPoster] = useState<File | null>(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState(''); // Untuk preview poster lama

  // 1. Fetch Data Event saat Load
  useEffect(() => {
    const init = async () => {
        try {
            const eventData = await getEventById(eventId);
            if (eventData) {
                setFormData({
                    title: eventData.title,
                    description: eventData.description,
                    category: eventData.category,
                    locationName: eventData.locationName,
                    lat: eventData.lat,
                    lng: eventData.lng,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate
                });
                // @ts-ignore
                if (eventData.tickets) setTickets(eventData.tickets);
                setCurrentPosterUrl(eventData.posterUrl || eventData.poster || '');
            } else {
                alert("Event tidak ditemukan");
                router.push('/eo/my-events');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Cek auth dulu baru fetch
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) router.push('/login');
        else init();
    });
    return () => unsubscribe();
  }, [eventId, router]);


  // --- HANDLERS (Sama dengan Create) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPoster(e.target.files[0]);
  };
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({ ...prev, lat, lng, locationName: address }));
  };
  const handleTicketChange = (index: number, field: keyof TicketData, value: string) => {
    const newTickets = [...tickets];
    // @ts-ignore
    newTickets[index][field] = value;
    setTickets(newTickets);
  };
  const addTicketVariant = () => setTickets([...tickets, { name: '', price: 0, stock: 50 }]);
  const removeTicketVariant = (index: number) => {
    if (tickets.length === 1) return;
    setTickets(tickets.filter((_, i) => i !== index));
  };


  // --- SUBMIT UPDATE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalData = { ...formData, tickets: tickets };
      
      // Panggil Service Update
      await updateEvent(eventId, finalData, poster); // poster null jika tidak diganti
      
      setModalContent({ title: "Berhasil Diupdate! ✅", message: "Data event telah diperbarui.", type: 'success' });
      setIsSuccess(true);
      setShowModal(true);
    } catch (error: any) {
      setModalContent({ title: "Gagal Update", message: error.message, type: 'error' });
      setShowModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess) router.push('/eo/my-events');
  };

  if (loading) return <div className="text-white p-10 text-center">Memuat data event...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Event ✏️</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* Detail Acara */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">Detail Acara</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Nama Event</label>
            <Input name="title" value={formData.title} onChange={handleChange} required className="text-gray-900" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Kategori</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                <option value="Musik">Musik</option>
                <option value="Festival">Festival</option>
                <option value="Workshop">Workshop</option>
                <option value="Pameran">Pameran</option>
                <option value="Olahraga">Olahraga</option>
              </select>
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-900 mb-1">Lokasi (Pilih di Peta Bawah)</label>
               <input className="w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 text-gray-900 cursor-not-allowed" value={formData.locationName} readOnly />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-xs font-bold text-blue-900 mb-2">Update Lokasi (Opsional)</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Waktu Mulai</label>
                <Input name="startDate" type="datetime-local" value={formData.startDate} onChange={handleChange} required className="text-gray-900" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Waktu Selesai</label>
                <Input name="endDate" type="datetime-local" value={formData.endDate} onChange={handleChange} required className="text-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Deskripsi Lengkap</label>
            <textarea name="description" value={formData.description} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" onChange={handleChange} required />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-medium text-gray-900 mb-2">Poster Event</label>
            {/* Preview Poster Lama */}
            {currentPosterUrl && !poster && (
                <div className="mb-3 w-32 h-32 rounded-lg overflow-hidden border border-gray-200 relative">
                    <img src={currentPosterUrl} className="w-full h-full object-cover" alt="Poster Lama" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs text-center p-1">Poster Saat Ini</div>
                </div>
            )}
            <FileInput label="Ganti Poster (Opsional)" accept="image/*" onChange={handleFileChange} />
          </div>
        </section>

        {/* Variasi Tiket */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Edit Tiket</h3>
            <button type="button" onClick={addTicketVariant} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 transition">
              + Tambah Varian
            </button>
          </div>
          
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Nama Tiket</label>
                  <Input value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} required className="text-gray-900 bg-white" />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Harga</label>
                  <Input type="number" value={ticket.price.toString()} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} required className="text-gray-900 bg-white" />
                </div>
                <div className="w-full md:w-1/4">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Kuota</label>
                  <Input type="number" value={ticket.stock.toString()} onChange={(e) => handleTicketChange(index, 'stock', e.target.value)} required className="text-gray-900 bg-white" />
                </div>
                {tickets.length > 1 && (
                  <button type="button" onClick={() => removeTicketVariant(index)} className="md:mb-1 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition">🗑️</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SUBMIT */}
        <div className="pt-4 flex justify-end gap-3">
           <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
           <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
           </Button>
        </div>

      </form>

      <StatusModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
}