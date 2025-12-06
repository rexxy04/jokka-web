import React from 'react';
import Link from 'next/link';

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
  isActive?: boolean; // Nanti bisa dikembangin buat highlight menu aktif
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, isActive }) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-800 text-white shadow-inner' // Style kalau aktif
          : 'text-gray-300 hover:bg-indigo-800 hover:text-white' // Style default
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
};

export default SidebarItem;