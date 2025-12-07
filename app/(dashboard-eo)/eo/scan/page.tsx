'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { verifyTicket } from '@/lib/services/transaction';

export default function ScanPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const user = auth.currentUser;
    if (!user) return setLoading(false);

    try {
      const res = await verifyTicket(orderId.trim(), user.uid);
      setResult(res.ticket);
      setOrderId(''); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-10">
      
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Validasi Tiket <span className="text-indigo-500">🎫</span></h1>
        <p className="text-gray-400">Masukkan Kode Booking / Order ID pengunjung untuk Check-in.</p>
      </div>

      {/* CARD INPUT */}
      <div className="bg-[#151923] p-8 rounded-3xl shadow-2xl border border-gray-800/50 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mt-32 pointer-events-none"></div>

        <form onSubmit={handleScan} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Kode Booking (Order ID)
            </label>
            <div className="flex gap-3">
              <input 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="TRX-XXXXXX..."
                className="flex-1 bg-[#0F111A] text-white border border-gray-700 rounded-xl px-4 py-3 text-lg font-mono uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-gray-600"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {loading ? "..." : "Check-In"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* HASIL VALIDASI */}
      
      {/* SUKSES */}
      {result && (
        <div className="bg-[#151923] border border-green-500/30 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Tiket Valid!</h2>
          <p className="text-green-400 font-medium">Pengunjung berhasil Check-in.</p>
          
          <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-300 space-y-2">
            <p>Event: <span className="text-white font-bold">{result.eventName}</span></p>
            <p>Nominal: <span className="text-white font-mono">Rp {result.amount.toLocaleString()}</span></p>
          </div>
        </div>
      )}

      {/* GAGAL */}
      {error && (
        <div className="bg-[#151923] border border-red-500/30 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Gagal Check-in</h2>
          <p className="text-red-400 font-medium text-lg">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Mohon periksa kembali tiket pengunjung.</p>
        </div>
      )}

    </div>
  );
}