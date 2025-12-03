import React from 'react';
import Link from 'next/link';
import SidebarEO from '@/components/eo/sidebarEO';

export default function EOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      
      {/* Panggil Sidebar Khusus EO */}
      <SidebarEO />

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold">EO Panel</span>
          <Link href="/" className="text-xs bg-red-600 px-3 py-1 rounded">Keluar</Link>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}