'use client'; // <--- WAJIB ADA untuk interaksi

import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button'; 

const Navbar = () => {
  // State untuk mengatur buka/tutup menu mobile
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <div className="text-2xl font-bold text-blue-600 z-50 relative">
            <Link href="/" onClick={() => setIsOpen(false)}>
              Jokka<span className="text-gray-800">.</span>
            </Link>
          </div>

          {/* Desktop Menu (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            <Link href="#pilihan-jokka" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Pilihan Jokka
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Tentang Kami
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition">
              Masuk
            </Link>
            <Button href="#" variant="primary" className="shadow-none">
              Daftar
            </Button>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden z-50 relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} // Toggle state saat diklik
              className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
            >
              {isOpen ? (
                // Ikon X (Close)
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Ikon Hamburger (Menu)
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {/* Muncul hanya jika isOpen == true */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col p-4 space-y-4 animate-fadeIn">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)} // Tutup menu saat link diklik
          >
            Home
          </Link>
          <Link 
            href="#pilihan-jokka" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Pilihan Jokka
          </Link>
          <Link 
            href="#" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Tentang Kami
          </Link>
          
          <div className="flex flex-col gap-3 pt-2">
            <Link href="#" className="text-center text-gray-600 font-medium py-2 border border-gray-200 rounded-lg">
              Masuk
            </Link>
            <Button href="#" variant="primary" className="w-full justify-center">
              Daftar Sekarang
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;