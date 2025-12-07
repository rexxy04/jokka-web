'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Button from '@/components/ui/Button';
import { saveTransaction } from '@/lib/services/transaction';
import { toggleWishlist, checkIsLoved } from '@/lib/services/wishlist';

// Tipe Data Tiket
interface TicketType {
  name: string;
  price: number;
  stock: number;
  sold: number;
}

interface DetailViewProps {
  id?: string;
  title: string;
  image: string;
  category: string;
  rating?: string;
  description?: string;
  location?: string;
  date?: string;
  price?: string; // (Ini cuma display range harga)
  eventId?: string;
  rawPrice?: number; // (Tidak dipakai lagi, kita ambil dari tickets)
  type?: 'event' | 'place';
  lat?: number;
  lng?: number;
  // PROPS BARU: Menerima Array Tiket
  tickets?: TicketType[];
}

const DetailView: React.FC<DetailViewProps> = ({
  id,
  title,
  image,
  category,
  rating,
  description,
  location,
  date,
  price,
  eventId,
  type = 'place',
  lat,
  lng,
  tickets = [] // Default kosong jika bukan event
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoved, setIsLoved] = useState(false);

  // STATE UNTUK PILIH TIKET
  const [selectedTicketIdx, setSelectedTicketIdx] = useState<number>(-1); // -1 artinya belum pilih
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const checkLoveStatus = async () => {
      const user = auth.currentUser;
      const targetId = id || eventId;
      if (user && targetId) {
        const status = await checkIsLoved(user.uid, targetId);
        setIsLoved(status);
      }
    };
    checkLoveStatus();
  }, [id, eventId]);

  const handleLove = async () => {
    const user = auth.currentUser;
    if (!user) return router.push('/login');
    const targetId = id || eventId;
    if (!targetId) return;

    const previousState = isLoved;
    setIsLoved(!isLoved);
    try {
      await toggleWishlist(user.uid, {
        id: targetId,
        type: eventId ? 'event' : 'place',
        title, image, category, location: location || ""
      });
    } catch (error) {
      setIsLoved(previousState);
      alert("Gagal menambahkan ke wishlist");
    }
  };

  // Logic Bayar yang Diperbarui
  const handleBuyTicket = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Silakan login terlebih dahulu untuk membeli tiket.");
      router.push('/login');
      return;
    }

    if (selectedTicketIdx === -1) {
      alert("Pilih jenis tiket terlebih dahulu!");
      return;
    }

    const ticket = tickets[selectedTicketIdx];
    
    // Validasi Stok (Client Side)
    const available = ticket.stock - (ticket.sold || 0);
    if (qty > available) {
      alert("Maaf, stok tiket tidak mencukupi.");
      return;
    }

    setLoading(true);

    try {
      const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const totalPrice = ticket.price * qty;

      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        body: JSON.stringify({
          id: orderId,
          productName: `${title} - ${ticket.name}`, // Nama Event + Jenis Tiket
          price: ticket.price,
          quantity: qty,
          buyerName: user.displayName || "User Jokka",
          buyerEmail: user.email,
          buyerPhone: "08123456789"
        })
      });

      const data = await response.json();
      if (!data.token) throw new Error("Gagal mendapatkan token pembayaran.");

      window.snap.pay(data.token, {
        onSuccess: async function(result: any) {
          await saveTransaction({
            orderId: result.order_id,
            eventId: eventId,
            eventName: `${title} (${ticket.name})`, // Simpan info tiket di nama transaksi
            userId: user.uid,
            amount: Number(result.gross_amount),
            status: result.transaction_status,
            paymentType: result.payment_type,
            transactionTime: result.transaction_time,
            // Opsional: Simpan detail tiket yang dibeli
            ticketType: ticket.name,
            qty: qty
          });
          alert("Pembayaran Berhasil! Tiket masuk ke Profil.");
          router.push('/profile');
        },
        onPending: async function(result: any) {
          await saveTransaction({
            orderId: result.order_id,
            eventId: eventId,
            eventName: `${title} (${ticket.name})`,
            userId: user.uid,
            amount: Number(result.gross_amount),
            status: 'pending',
            paymentType: result.payment_type,
            transactionTime: result.transaction_time
          });
          alert("Menunggu Pembayaran. Cek Profil Anda.");
          router.push('/profile');
        },
        onError: function(result: any) { alert("Pembayaran Gagal!"); },
        onClose: function() { /* User tutup popup */ }
      });

    } catch (error: any) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper Format Rupiah
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const handleOpenMaps = () => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    } else if (location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
    } else {
      alert("Lokasi belum diatur.");
    }
  };

  return (
    <article className="bg-white min-h-screen pb-20">
      {/* HERO IMAGE */}
      <div className="relative h-[50vh] md:h-[60vh] w-full group">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute top-24 left-4 md:left-8 z-10">
           <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
             ← Kembali
           </Link>
        </div>

        <button onClick={handleLove} className="absolute top-24 right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLoved ? "#ef4444" : "none"} stroke={isLoved ? "#ef4444" : "white"} strokeWidth="2" className="w-7 h-7 transition-colors duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-md mb-3 inline-block shadow-lg">{category}</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{title}</h1>
            <div className="flex items-center gap-4 text-gray-200 text-sm md:text-base">
              {rating && <span className="flex items-center gap-1 text-yellow-400 font-bold">⭐ {rating}</span>}
              {location && <span className="flex items-center gap-1">📍 {location}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="container mx-auto px-4 py-12 md:flex gap-12">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {description || "Belum ada deskripsi lengkap."}
          </p>
        </div>

        {/* SIDEBAR BOOKING */}
        <div className="md:w-1/3 mt-8 md:mt-0">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Pilih Tiket</h3>
            
            {/* TANGGAL */}
            <div className="mb-4 text-sm flex justify-between">
               <span className="text-gray-500">Tanggal</span>
               <span className="font-medium text-gray-900">{date || "-"}</span>
            </div>

            {/* LIST TIKET (SELECTOR) */}
            {tickets.length > 0 ? (
              <div className="space-y-3 mb-6">
                {tickets.map((t, idx) => {
                  const available = t.stock - (t.sold || 0);
                  const isSoldOut = available <= 0;
                  const isSelected = selectedTicketIdx === idx;

                  return (
                    <div 
                      key={idx}
                      onClick={() => !isSoldOut && setSelectedTicketIdx(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSoldOut ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' 
                        : isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                          <p className="text-xs text-gray-500">{isSoldOut ? 'Habis' : `Sisa: ${available}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 text-sm">{t.price === 0 ? 'FREE' : formatRupiah(t.price)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-lg mb-4">
                Tidak ada info tiket tersedia.
              </div>
            )}

            {/* QUANTITY COUNTER (Muncul jika tiket sudah dipilih) */}
            {selectedTicketIdx !== -1 && (
              <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-600">Jumlah Tiket</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >-</button>
                  <span className="font-bold w-4 text-center">{qty}</span>
                  <button 
                    onClick={() => {
                      const t = tickets[selectedTicketIdx];
                      const max = t.stock - (t.sold || 0);
                      setQty(Math.min(max, qty + 1));
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >+</button>
                </div>
              </div>
            )}

            {/* TOTAL & BUTTON */}
            {selectedTicketIdx !== -1 && (
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatRupiah(tickets[selectedTicketIdx].price * qty)}
                </span>
              </div>
            )}

            <Button 
              onClick={handleBuyTicket} 
              variant="primary" 
              className="w-full justify-center py-3 text-lg shadow-blue-500/20"
              disabled={loading || (tickets.length > 0 && selectedTicketIdx === -1)}
            >
              {loading ? "Memproses..." : "Beli Tiket Sekarang"}
            </Button>
            
            <div className="mt-4 space-y-2">
              <Button 
                onClick={handleOpenMaps} 
                variant="outline" 
                className="w-full justify-center text-sm border-gray-300 text-gray-600"
              >
                📍 Lihat Lokasi Peta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DetailView;