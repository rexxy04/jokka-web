import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 tracking-wide">
          Admin Jokka<span className="text-blue-500">.</span>
        </h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            Dashboard
          </Link>
          {/* MENU BARU KITA */}
          <Link href="/admin/approvals" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            👮‍♂️ Approval EO
          </Link>
          <Link href="/admin/manage-wisata" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition">
            🏖️ Kelola Wisata
          </Link>
          <div className="border-t border-gray-700 mt-4 pt-4">
             <Link href="/" className="block px-4 py-2 rounded text-red-400 hover:bg-gray-800 hover:text-red-300 transition">
              Keluar
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}