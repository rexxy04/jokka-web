'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // --- FUNGSI LOGOUT BARU ---
  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar dan mengakhiri sesi Admin?")) {
        await signOut(auth);
        router.push('/login'); // Redirect ke halaman login
    }
  };
  // --------------------------

  useEffect(() => {
    // Listener Auth: Cek setiap kali status login berubah
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        const profile = await getUserProfile(user.uid);
        
        if (profile?.role === 'admin') {
          setAuthorized(true);
        } else {
          alert("Anda tidak memiliki akses ke halaman Admin!");
          router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Memeriksa akses Admin...</p>
      </div>
    );
  }

  // Jika lolos, tampilkan Sidebar & Konten
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 tracking-wide">
          Admin Jokka<span className="text-blue-500">.</span>
        </h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            Dashboard
          </Link>


          <Link href="/admin/approvals" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            👮‍♂️ Approval EO
          </Link>

          <Link href="/admin/partners" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            🤝 List Partner EO
          </Link>

          
          <Link href="/admin/event-approvals" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            🎫 Approval Event
          </Link>

          
          <Link href="/admin/manage-wisata" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            🏖️ Kelola Wisata
          </Link>
          
          {/* TOMBOL LOGOUT AKTIF */}
          <div className="border-t border-gray-700 mt-4 pt-4">
             <button 
                onClick={handleLogout} 
                className="w-full text-left px-4 py-2 rounded text-red-400 hover:bg-gray-800 hover:text-red-300 transition"
             >
              🚪 Logout
            </button>
          </div>
        </nav>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}