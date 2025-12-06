'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input';
import { getUserTransactions, Transaction } from '@/lib/services/transaction'; // Import Service

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userDataFirestore, setUserDataFirestore] = useState<any>(null);
  
  // State untuk menyimpan Tiket
  const [tickets, setTickets] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // 1. Fetch Data User
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserDataFirestore(docSnap.data());

        // 2. Fetch Riwayat Transaksi (Tiket)
        const myTickets = await getUserTransactions(currentUser.uid);
        setTickets(myTickets);
        
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleResetPassword = () => {
    alert("Link reset password akan dikirim ke email Anda.");
  };

  // Helper untuk warna status
  const getStatusColor = (status: string) => {
    if (status === 'settlement' || status === 'capture') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat profil...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: INFO USER */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-4 text-gray-400 font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.displayName}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <Button onClick={handleResetPassword} variant="outline" className="w-full justify-center text-sm">🔒 Ganti Password</Button>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-center text-sm text-red-600 border-red-200 hover:bg-red-50">🚪 Keluar</Button>
            </div>
          </div>

          {/* KOLOM KANAN: DATA & TIKET */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Form Read-only */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={user?.displayName || ''} disabled className="bg-gray-50" />
                <Input value={userDataFirestore?.username || '-'} disabled className="bg-gray-50" />
                <Input value={user?.email || ''} disabled className="bg-gray-50" />
                <Input value={userDataFirestore?.phone || 'Belum diatur'} disabled className="bg-gray-50" />
              </div>
            </section>

            {/* --- SECTION TIKET SAYA --- */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Tiket & Riwayat Transaksi 🎫</h3>

              {tickets.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
                  <p>Belum ada tiket yang dibeli.</p>
                  <Button href="/event" variant="outline" className="text-sm">Cari Event Seru</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                      
                      {/* Info Tiket */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'settlement' ? 'LUNAS' : ticket.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">ORDER ID: {ticket.orderId}</span>
                        </div>
                        <h4 className="font-bold text-lg text-gray-900">{ticket.eventName}</h4>
                        <p className="text-sm text-gray-500">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticket.amount)} 
                          {' • '} {ticket.paymentType.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>

                      {/* Tombol Aksi */}
                      <div>
                        {ticket.status === 'pending' ? (
                          <Button href={`https://app.sandbox.midtrans.com/snap/v3/redirection/${ticket.id}`} variant="primary" className="text-sm bg-yellow-500 hover:bg-yellow-600 border-0">
                            Bayar Sekarang
                          </Button>
                        ) : ticket.status === 'settlement' || ticket.status === 'capture' ? (
                          <Button variant="outline" className="text-sm border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100">
                            Lihat E-Ticket
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400 font-medium">Kadaluarsa</span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}