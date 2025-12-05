'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input'; // Sesuaikan casing file Input kamu
import Card from '@/components/ui/card';
import Link from 'next/link';    // Sesuaikan casing file Card kamu

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userDataFirestore, setUserDataFirestore] = useState<any>(null);

  // 1. Cek Login & Fetch Data Tambahan
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch data tambahan dari Firestore (misal: no. telp)
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDataFirestore(docSnap.data());
        }
        
        setLoading(false);
      } else {
        router.push('/login'); // Kalau belum login, tendang ke login
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Fungsi Logout
  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar?")) {
      await signOut(auth);
      router.push('/');
    }
  };

  // 3. Fungsi Reset Password
  const handleResetPassword = () => {
    alert("Link reset password akan dikirim ke email Anda. (Fitur Logic menyusul)");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat profil...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* --- KOLOM KIRI: INFO UTAMA --- */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Card Foto Profil */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-4 overflow-hidden relative group">
                {/* Placeholder Foto - Ganti src kalau ada foto */}
                {/* <img src="/path/to/avatar.jpg" className="w-full h-full object-cover" /> */}
                <span className="text-gray-400 font-bold group-hover:hidden">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </span>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs">
                  Ganti Foto
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.displayName || "Pengguna Jokka"}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-4 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                Member User
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <Button onClick={handleResetPassword} variant="outline" className="w-full justify-center text-sm">
                🔒 Ganti Password
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-center text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                🚪 Keluar Akun
              </Button>
            </div>
          </div>

          {/* --- KOLOM KANAN: DETAIL & BOOKMARK --- */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Form Pengaturan Akun */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Pengaturan Data Akun</h3>
                <button className="text-blue-600 text-sm font-semibold hover:underline">Edit Data</button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
                    <Input value={user?.displayName || ''} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                    <Input value={userDataFirestore?.username || '-'} disabled className="bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <Input value={user?.email || ''} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Telepon</label>
                  <Input value={userDataFirestore?.phone || 'Belum diatur'} disabled className="bg-gray-50" />
                </div>
              </div>
            </section>

            {/* Bookmark Section */}
            <section>
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg font-bold text-gray-900">Disimpan / Bookmark ❤️</h3>
                <Link href="/destinasi" className="text-sm text-blue-600 hover:underline"> Tambah lagi </Link>
              </div>

              {/* Placeholder Card Bookmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kita pakai dummy dulu untuk visualisasi */}
                <Card 
                  title="Pantai Losari (Contoh Bookmark)" 
                  category="Alam"
                  image="/images/featured-main.jpg" 
                  href="/destinasi/1" 
                />
                <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center h-48 text-gray-400 text-sm">
                  Belum ada item lain disimpan.
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}