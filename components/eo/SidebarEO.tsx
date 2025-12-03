import React from 'react';
import Link from 'next/link';
import SidebarItem from '@/components/ui/SidebarItem';

const SidebarEO = () => {
  return (
    <aside className="w-64 bg-indigo-900 text-white hidden md:flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-indigo-800 font-bold text-xl tracking-wide">
        EO Panel<span className="text-indigo-400">.</span>
      </div>
      
      {/* Menu Navigasi */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        <SidebarItem href="/eo/dashboard" icon="📊" label="Dashboard" />
        <SidebarItem href="/eo/my-events" icon="📅" label="Event Saya" />
        <SidebarItem href="/eo/sales" icon="💰" label="Laporan Penjualan" />
        <SidebarItem href="/eo/scan" icon="📱" label="Scan Tiket" />
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-indigo-800">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-600/80 transition text-sm text-gray-200 hover:text-white"
        >
          <span>🚪</span> Keluar ke Home
        </Link>
      </div>
    </aside>
  );
};

export default SidebarEO;