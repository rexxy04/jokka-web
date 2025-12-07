'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/auth';
// 1. Import StatusModal
import StatusModal from '@/components/ui/StatusModal';

export default function EOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 2. State untuk Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const handleLogout = async () => {
    // Kita biarkan confirm bawaan browser untuk logout agar ada opsi Yes/No
    if (confirm("Yakin ingin keluar dari sesi EO?")) {
        await signOut(auth);
        router.push('/login');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        const profile = await getUserProfile(currentUser.uid);
        if (profile?.role === 'eo') {
          setAuthorized(true);
          setUser(currentUser);
        } else {
          // 🔴 KODE LAMA (DIHAPUS):
          // alert("Halaman ini khusus Partner EO.");
          // router.push('/');

          // 🟢 KODE BARU (PAKAI MODAL):
          // Kita tampilkan modal, redirect dilakukan saat modal ditutup (lihat logic render di bawah)
          setModalContent({
            title: "Akses Ditolak",
            message: "Akun Anda tidak memiliki izin untuk mengakses Dashboard EO."
          });
          setShowModal(true);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // JIKA BELUM AUTHORIZED (Loading atau Akses Ditolak)
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F111A] text-white">
        <p className="text-gray-400 animate-pulse">Memuat Dashboard EO...</p>
        
        {/* 3. Render Modal di sini agar muncul saat akses ditolak */}
        <StatusModal 
            isOpen={showModal}
            title={modalContent.title}
            message={modalContent.message}
            onClose={() => {
                setShowModal(false);
                // Redirect ke Home hanya jika modal ditutup saat state belum authorized
                router.push('/'); 
            }}
        />
      </div>
    );
  }

  // JIKA AUTHORIZED (Tampilkan Layout Utama)
  return (
    <div className="min-h-screen flex bg-[#0F111A] font-sans text-gray-200">
      
      {/* SIDEBAR (Dark Theme) */}
      <aside className="w-64 bg-[#151923] hidden md:flex flex-col flex-shrink-0 border-r border-gray-800/50">
        
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">E</span>
            </div>
            <span className="font-bold text-xl tracking-wide text-white">
              EO Panel<span className="text-indigo-500">.</span>
            </span>
          </div>
        </div>
        
        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* Kita pakai SidebarItem lokal yang ada di bawah */}
          <SidebarItem href="/eo/dashboard" icon="dashboard" label="Dashboard" />
          <SidebarItem href="/eo/my-events" icon="calendar" label="Event Saya" />
          <SidebarItem href="/eo/sales" icon="chart" label="Laporan Penjualan" />
          <SidebarItem href="/eo/scan" icon="scan" label="Scan Tiket" />
        </nav>

        {/* User Profile & Logout (Bottom Sidebar) */}
        <div className="p-4 border-t border-gray-800/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {user?.displayName?.charAt(0).toUpperCase() || "E"}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user?.displayName || "EO User"}</p>
                    <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition text-left">
                        Logout
                    </button>
                </div>
            </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none z-0" />

        <header className="md:hidden bg-[#151923] text-white p-4 flex justify-between items-center border-b border-gray-800 z-10">
          <span className="font-bold">EO Panel</span>
          <button onClick={handleLogout} className="text-xs bg-red-600/20 text-red-400 px-3 py-1 rounded-full">Keluar</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10 relative">
          {children}
        </div>
      </main>

      {/* 4. Pasang Modal juga di sini (jaga-jaga untuk penggunaan lain di masa depan) */}
      <StatusModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
}

// --- KOMPONEN LOKAL SIDEBAR ITEM (CUSTOM DARK MODE) ---
const SidebarItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => {
    const getIcon = (name: string) => {
        if (name === 'dashboard') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
        if (name === 'calendar') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        if (name === 'chart') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
        if (name === 'scan') return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-4H8m1-9v-2m0 2H7m15 0h-2m-2 2v2m-2-2h2" /></svg>; 
        return null;
    }

    return (
        <Link 
            href={href} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[#1E2230] hover:text-white transition-all duration-200 group"
        >
            <span className="group-hover:text-indigo-400 transition-colors">{getIcon(icon)}</span>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}