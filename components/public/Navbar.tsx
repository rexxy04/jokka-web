'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button'; 

const Navbar = () => {
  // State untuk mengatur buka/tutup menu mobile
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Navbar Container: Fixed di atas, Glassmorphism (blur), ada shadow halus
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* --- LOGO --- */}
          <div className="text-2xl font-bold text-blue-600 z-50 relative">
            <Link href="/" onClick={() => setIsOpen(false)}>
              Jokka<span className="text-gray-800">.</span>
            </Link>
          </div>

          {/* --- DESKTOP MENU (Hidden di Mobile) --- */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            <Link href="/destinasi" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Destinasi
            </Link>
            <Link href="/event" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Event
            </Link>
            <Link href="/#pilihan-jokka" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Pilihan Editor
            </Link>
          </div>

          {/* --- DESKTOP AUTH BUTTONS --- */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Link ke Login */}
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition">
              Masuk
            </Link>
            {/* Tombol ke Register (Pakai component Button) */}
            <Button href="/register" variant="primary" className="shadow-none">
              Daftar
            </Button>
          </div>

          {/* --- MOBILE MENU BUTTON (Hamburger) --- */}
          <div className="md:hidden z-50 relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
            >
              {/* Logika Ganti Icon: Kalau buka tampil X, kalau tutup tampil Garis 3 */}
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {/* Hanya muncul jika state isOpen bernilai TRUE */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col p-4 space-y-4 animate-fadeIn">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/destinasi" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Destinasi
          </Link>
          <Link 
            href="/event" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Event
          </Link>
          
          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Link 
              href="/login" 
              className="text-center text-gray-600 font-medium py-2 border border-gray-200 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Masuk
            </Link>
            <Button href="/register" variant="primary" className="w-full justify-center">
              Daftar Sekarang
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;