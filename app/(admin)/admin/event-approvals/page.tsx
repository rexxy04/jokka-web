'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { getPendingEvents, approveEvent, rejectEvent, EventData } from '@/lib/services/admin';
import StatusModal from '@/components/ui/StatusModal'; // 1. Import StatusModal

export default function EventApprovalPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 2. State untuk Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, message: string, type: 'success' | 'error'}>({ 
    title: '', message: '', type: 'success' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getPendingEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleApprove = async (id: string, title: string) => {
    if (!confirm(`Tayangkan event "${title}" ke publik?`)) return;
    setProcessingId(id);
    try {
      await approveEvent(id);
      
      // GANTI ALERT DENGAN MODAL
      setModalContent({
        title: "Event Ditayangkan! 🚀",
        message: `Event "${title}" berhasil diapprove dan sekarang live di website publik.`,
        type: 'success'
      });
      setShowModal(true);
      
      fetchData(); // Refresh list
    } catch (error) {
      setModalContent({ title: "Gagal", message: "Terjadi kesalahan sistem.", type: 'error' });
      setShowModal(true);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, title: string) => {
    if (!confirm(`Tolak event "${title}"? EO akan diberitahu.`)) return;
    setProcessingId(id);
    try {
      await rejectEvent(id);
      
      // GANTI ALERT DENGAN MODAL
      setModalContent({
        title: "Event Ditolak ❌",
        message: `Event "${title}" telah ditolak.`,
        type: 'success' // Sukses menolak
      });
      setShowModal(true);

      fetchData();
    } catch (error) {
      setModalContent({ title: "Gagal", message: "Gagal menolak event.", type: 'error' });
      setShowModal(true);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Event Masuk 🎫</h1>
          <p className="text-sm text-gray-500">Review konten event sebelum tayang di publik.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="text-sm py-2">
          🔄 Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          <p>Sedang memuat data event...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-4xl mb-2">✨</p>
          <p className="text-gray-900 font-medium">Semua Bersih!</p>
          <p className="text-gray-500 text-sm">Tidak ada event baru yang perlu direview saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              
              {/* Poster Preview (FIX IMAGE SOURCE) */}
              <div className="h-48 bg-gray-100 relative group">
                <img 
                  // Prioritaskan posterUrl (schema baru), fallback ke poster (schema lama)
                  src={event.posterUrl || event.poster || '/placeholder-event.jpg'} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
                  {event.category}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1" title={event.title}>{event.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    📍 {event.locationName || "Lokasi tidak tersedia"}
                  </p>
                  <p className="text-xs text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-1 rounded mb-4">
                    📅 {event.startDate ? new Date(event.startDate).toLocaleString('id-ID') : "-"}
                  </p>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button 
                    onClick={() => handleApprove(event.id, event.title)}
                    variant="primary" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs py-2 shadow-none border-0"
                    disabled={processingId === event.id}
                  >
                    {processingId === event.id ? "..." : "Tayangkan"}
                  </Button>
                  <Button 
                    onClick={() => handleReject(event.id, event.title)}
                    variant="outline" 
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs py-2"
                    disabled={processingId === event.id}
                  >
                    Tolak
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Render Modal */}
      <StatusModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
}