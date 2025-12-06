'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import Input from '@/components/ui/input'; // Sesuaikan casing (Input/input)
import Button from '@/components/ui/Button';
import { verifyTicket } from '@/lib/services/transaction';

export default function ScanPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk Hasil Scan
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      alert("Sesi habis.");
      setLoading(false);
      return;
    }

    try {
      // Panggil Service Validasi
      const res = await verifyTicket(orderId.trim(), user.uid);
      setResult(res.ticket);
      // Kosongkan input biar siap scan berikutnya
      setOrderId(''); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Validasi Tiket 📱</h1>
        <p className="text-gray-500 mt-2">Masukkan Kode Booking / Order ID pengunjung untuk Check-in.</p>
      </div>

      {/* FORM INPUT */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Kode Booking (Order ID)
            </label>
            <div className="flex gap-2">
              <Input 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Contoh: TRX-1748239..."
                className="text-lg py-3 font-mono uppercase"
                autoFocus // Biar langsung siap ketik
              />
              <Button type="submit" variant="primary" className="px-8" disabled={loading}>
                {loading ? "Cek..." : "Check-In"}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              *Masukkan ID yang tertera di tiket pengunjung (Mulai dengan TRX-...)
            </p>
          </div>
        </form>
      </div>

      {/* HASIL VALIDASI */}
      
      {/* 1. SUKSES */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-pulse">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-1">Tiket Valid!</h2>
          <p className="text-green-600">Pengunjung berhasil Check-in.</p>
          
          <div className="mt-4 pt-4 border-t border-green-200 text-sm text-green-800 space-y-1">
            <p><strong>Event:</strong> {result.eventName}</p>
            <p><strong>Nominal:</strong> Rp {result.amount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* 2. ERROR / GAGAL */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-1">Gagal Check-in</h2>
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <p className="text-red-500 text-sm mt-2">Mohon periksa kembali tiket pengunjung.</p>
        </div>
      )}

    </div>
  );
}