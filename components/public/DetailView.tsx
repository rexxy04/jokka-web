'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Button from '@/components/ui/Button';
// Import Service Baru
import { saveTransaction } from '@/lib/services/transaction';

interface DetailViewProps {
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
}

const DetailView: React.FC<DetailViewProps> = ({
  title,
  image,
  category,
  rating,
  description,
  location,
  date,
  price,
  eventId,
  rawPrice
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

      // 1. Minta Token
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

      // 2. Tampilkan Popup
      window.snap.pay(data.token, {
        // --- SUKSES ---
        onSuccess: async function(result: any) {
          console.log("Payment Success:", result);
          
          // Simpan ke Database
          await saveTransaction({
            orderId: result.order_id,
            eventId: eventId,
            eventName: title, // Simpan judul event biar gak perlu fetch ulang
            userId: user.uid,
            amount: Number(result.gross_amount),
            status: result.transaction_status, // biasanya 'settlement' atau 'capture'
            paymentType: result.payment_type,
            transactionTime: result.transaction_time
          });

          alert("Pembayaran Berhasil! Tiket sudah masuk ke Profil Anda.");
          router.push('/profile'); // Redirect ke profil untuk lihat tiket
        },
        
        // --- PENDING ---
        onPending: async function(result: any) {
          console.log("Payment Pending:", result);
          
          // Tetap simpan walau pending (User bisa bayar nanti)
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

          alert("Menunggu Pembayaran. Cek instruksi di Profil Anda.");
          router.push('/profile');
        },
        
        // --- ERROR ---
        onError: function(result: any) {
          alert("Pembayaran Gagal!");
          console.log(result);
        },
        onClose: function() {
          alert('Anda menutup popup tanpa menyelesaikan pembayaran');
        }
      });

    } catch (error: any) {
      console.error(error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-24 left-4 md:left-8 z-10">
           <Link href="/event" className="flex items-center gap-2 text-white/80 hover:text-white transition bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
             &larr; Kembali
           </Link>
        </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Acara</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {description || "Belum ada deskripsi lengkap."}
          </p>
        </div>

        <div className="md:w-1/3 mt-8 md:mt-0">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Informasi Tiket</h3>
            <ul className="space-y-4 mb-6">
              {date && (
                 <li className="flex justify-between border-b border-gray-200 pb-2">
                   <span className="text-gray-500">Tanggal</span>
                   <span className="font-medium text-gray-900 text-right">{date}</span>
                 </li>
              )}
              <li className="flex justify-between border-b border-gray-200 pb-2">
                 <span className="text-gray-500">Harga Mulai</span>
                 <span className="font-bold text-green-600 text-right text-lg">{price}</span>
              </li>
            </ul>

            {/* Tombol Bayar */}
            {rawPrice && rawPrice > 0 ? (
              <Button 
                onClick={handleBuyTicket} 
                variant="primary" 
                className="w-full justify-center py-3 text-lg shadow-blue-500/20"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Beli Tiket Sekarang"}
              </Button>
            ) : (
              <Button href="#" variant="outline" className="w-full justify-center py-3" disabled>
                Event Gratis / Tiket Habis
              </Button>
            )}
            
            <p className="text-xs text-center text-gray-400 mt-3">
              Transaksi aman didukung oleh Midtrans
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DetailView;