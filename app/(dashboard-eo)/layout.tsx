'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // <-- Tambahkan signOut
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/auth';
import SidebarItem from '@/components/ui/SidebarItem'; // Digunakan untuk menu

export default function EOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // --- FUNGSI LOGOUT BARU ---
  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar dari sesi EO?")) {
        await signOut(auth);
        router.push('/login'); // Redirect ke halaman login
    }
  };
  // --------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        const profile = await getUserProfile(user.uid);
        
        // Cek Role: Harus EO
        if (profile?.role === 'eo') {
          setAuthorized(true);
        } else {
          alert("Halaman ini khusus Partner EO.");
          router.push('/');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Memuat Dashboard EO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* SIDEBAR EO */}
      <aside className="w-64 bg-indigo-900 text-white hidden md:flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-indigo-800 font-bold text-2xl tracking-wide">
          EO Panel<span className="text-indigo-400">.</span>
        </div>
        
        {/* Menu Navigasi */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <SidebarItem href="/eo/dashboard" icon="📊" label="Dashboard" />
          <SidebarItem href="/eo/my-events" icon="📅" label="Event Saya" />
          <SidebarItem href="/eo/sales" icon="💰" label="Laporan Penjualan" />
          <SidebarItem href="/eo/scan" icon="📱" label="Scan Tiket" />
        </nav>

        {/* Footer Sidebar (Tombol Logout) */}
        <div className="p-4 border-t border-indigo-800">
            <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-600/80 transition text-sm text-gray-200 hover:text-white flex items-center gap-3"
            >
                🚪 Logout
            </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold">EO Panel</span>
          <button onClick={handleLogout} className="text-xs bg-red-600 px-3 py-1 rounded">Logout</button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}