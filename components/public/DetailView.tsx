'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Button from '@/components/ui/Button';
import { saveTransaction } from '@/lib/services/transaction';
// Import Service Wishlist
import { toggleWishlist, checkIsLoved } from '@/lib/services/wishlist';

interface DetailViewProps {
  id?: string; // ID UNIK ITEM (Wajib untuk wishlist)
  title: string;
  image: string;
  category: string;
  rating?: string;
  description?: string;
  location?: string;
  date?: string;
  price?: string;     
  eventId?: string;   
  rawPrice?: number;
  type?: 'event' | 'place'; // Pembeda tipe
}

const DetailView: React.FC<DetailViewProps> = ({
  id, // ID Item (dari Firestore)
  title,
  image,
  category,
  rating,
  description,
  location,
  date,
  price,
  eventId,
  rawPrice,
  type = 'place' // Default tipe 'place' (wisata)
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoved, setIsLoved] = useState(false); // State Love

  // Cek Status Love saat pertama load
  useEffect(() => {
    const checkLoveStatus = async () => {
      const user = auth.currentUser;
      const targetId = id || eventId; // Gunakan id atau eventId
      if (user && targetId) {
        const status = await checkIsLoved(user.uid, targetId);
        setIsLoved(status);
      }
    };
    checkLoveStatus();
  }, [id, eventId]);

  // --- LOGIC LOVE / WISHLIST ---
  const handleLove = async () => {
    const user = auth.currentUser;
    if (!user) return router.push('/login');

    const targetId = id || eventId;
    if (!targetId) return;

    // Optimistic UI Update (Ubah warna dulu biar cepat)
    const previousState = isLoved;
    setIsLoved(!isLoved);

    try {
      const result = await toggleWishlist(user.uid, {
        id: targetId,
        type: eventId ? 'event' : 'place', // Deteksi otomatis
        title,
        image,
        category,
        location
      });
      // alert(result.message); // Optional: Alert kalau mau
    } catch (error) {
      setIsLoved(previousState); // Rollback kalau error
      alert("Gagal menambahkan ke wishlist");
    }
  };

  // --- LOGIC PEMBAYARAN MIDTRANS ---
  const handleBuyTicket = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Silakan login terlebih dahulu untuk membeli tiket.");
      router.push('/login');
      return;
    }

    if (!eventId || !rawPrice) {
      alert("Event ini gratis atau data tiket tidak valid.");
      return;
    }

    setLoading(true);

    try {
      const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        body: JSON.stringify({
          id: orderId,
          productName: title,
          price: rawPrice,
          quantity: 1,
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
            eventName: title,
            userId: user.uid,
            amount: Number(result.gross_amount),
            status: result.transaction_status,
            paymentType: result.payment_type,
            transactionTime: result.transaction_time
          });
          alert("Pembayaran Berhasil! Tiket masuk ke Profil.");
          router.push('/profile');
        },
        onPending: async function(result: any) {
          await saveTransaction({
            orderId: result.order_id,
            eventId: eventId,
            eventName: title,
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
        onClose: function() { alert('Anda menutup popup tanpa menyelesaikan pembayaran'); }
      });

    } catch (error: any) {
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white min-h-screen pb-20">
      {/* HERO IMAGE */}
      <div className="relative h-[50vh] md:h-[60vh] w-full group">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Navigasi Back */}
        <div className="absolute top-24 left-4 md:left-8 z-10">
           <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
             &larr; Kembali
           </Link>
        </div>

        {/* --- TOMBOL LOVE (BARU) --- */}
        <button 
          onClick={handleLove}
          className="absolute top-24 right-4 md:right-8 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/30"
        >
          {/* Ikon Jantung SVG */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isLoved ? "#ef4444" : "none"} // Merah jika Loved, Transparan jika tidak
            stroke={isLoved ? "#ef4444" : "white"} 
            strokeWidth="2" 
            className="w-7 h-7 transition-colors duration-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Judul */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-md mb-3 inline-block shadow-lg">
              {category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-gray-200 text-sm md:text-base">
              {rating && <span className="flex items-center gap-1 text-yellow-400 font-bold">⭐ {rating}</span>}
              {location && <span className="flex items-center gap-1">📍 {location}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 md:flex gap-12">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {description || "Belum ada deskripsi lengkap."}
          </p>
        </div>

        <div className="md:w-1/3 mt-8 md:mt-0">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Informasi</h3>
            <ul className="space-y-4 mb-6">
              {date && (
                 <li className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Tanggal</span>
                   <span className="font-medium text-gray-900 text-right">{date}</span>
                 </li>
              )}
              <li className="flex justify-between border-b border-gray-200 pb-2">
                 <span className="text-gray-500">Harga</span>
                 <span className="font-bold text-green-600 text-right text-lg">{price}</span>
              </li>
            </ul>

            {rawPrice && rawPrice > 0 ? (
              <Button onClick={handleBuyTicket} variant="primary" className="w-full justify-center py-3 text-lg" disabled={loading}>
                {loading ? "Memproses..." : "Beli Tiket"}
              </Button>
            ) : (
              <Button href="#" variant="outline" className="w-full justify-center py-3" disabled>
                {rawPrice === 0 ? "Gratis / Free Entry" : "Tiket Habis"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default DetailView;