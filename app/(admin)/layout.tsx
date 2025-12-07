'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); 
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogout = async () => {
    if (confirm("Yakin ingin keluar dari sesi Admin?")) {
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
        if (profile?.role === 'admin') {
          setAuthorized(true);
          setUser(currentUser);
        } else {
          alert("Akses Ditolak. Halaman ini khusus Administrator.");
          router.push('/');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50 text-purple-900">
        <p className="animate-pulse font-medium">Memuat Dashboard Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#F3F0FF] via-[#F8F9FF] to-[#EAFBFF] font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white hidden md:flex flex-col flex-shrink-0 border-r border-gray-100 shadow-sm z-10 rounded-r-[2rem] my-4 ml-4 h-[calc(100vh-2rem)]">
        
        {/* Logo */}
        <div className="h-24 flex items-center px-8">
          <h1 className="font-extrabold text-2xl tracking-tight text-gray-900">
            Jokka<span className="text-purple-600">.</span> Admin
          </h1>
        </div>
        
        {/* Menu Navigasi (LINK DIPERBAIKI DISINI) */}
        <nav className="flex-1 px-4 space-y-3 overflow-y-auto py-4">
          <SidebarItem href="/admin/dashboard" icon="dashboard" label="Dashboard" isActive={pathname === '/admin/dashboard'} />
          
          <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verifikasi</p>
          </div>
          
          {/* 1. Link Approval EO */}
          <SidebarItem href="/admin/approvals" icon="user-check" label="Approval EO" isActive={pathname === '/admin/approvals'} />
          
          {/* 2. Link Approval Event */}
          <SidebarItem href="/admin/event-approvals" icon="calendar-check" label="Approval Event" isActive={pathname === '/admin/event-approvals'} />
          
          <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Master</p>
          </div>
          
          <SidebarItem href="/admin/partners" icon="users" label="List Partner EO" isActive={pathname === '/admin/partners'} />
          
          {/* 3. Link Kelola Wisata */}
          <SidebarItem href="/admin/manage-wisata" icon="map" label="Kelola Wisata" isActive={pathname === '/admin/manage-wisata'} />
        </nav>

        {/* Profile & Logout */}
        <div className="p-6">
            <div className="bg-purple-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                    A
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.displayName || "Admin"}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                </div>
            </div>
            <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl transition-all font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
            </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white text-gray-900 p-4 flex justify-between items-center border-b border-gray-100 shadow-sm">
          <span className="font-bold text-lg">Jokka Admin</span>
          <button onClick={handleLogout} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">Keluar</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 relative scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

const SidebarItem = ({ href, icon, label, isActive }: { href: string; icon: string; label: string; isActive: boolean }) => {
    const getIcon = (name: string) => {
        if (name === 'dashboard') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
        if (name === 'user-check') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        if (name === 'calendar-check') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        if (name === 'users') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        if (name === 'map') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
        return null;
    }

    return (
        <Link 
            href={href} 
            className={`flex items-center gap-4 px-6 py-4 rounded-[1.2rem] transition-all duration-300 group font-bold
                ${isActive 
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-200' 
                    : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                }
            `}
        >
            <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}`}>{getIcon(icon)}</span>
            <span className="text-sm">{label}</span>
        </Link>
    );
}