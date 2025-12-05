'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/auth';
import SidebarEO from '@/components/eo/SidebarEO';

export default function EOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

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
      <SidebarEO />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold">EO Panel</span>
          <Link href="/" className="text-xs bg-red-600 px-3 py-1 rounded">Keluar</Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}