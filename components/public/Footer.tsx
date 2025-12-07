// components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* KOLOM 1: LOGO & DESKRIPSI */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/">
              <div className="relative w-36 h-12">
                <Image 
                  src="/images/logo-jokka.png" 
                  alt="Jokka Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Platform terbaik untuk menemukan event seru dan destinasi wisata di sekitarmu. Jelajahi, pesan tiket, dan nikmati momennya.
            </p>
          </div>

          {/* KOLOM 2: NAVIGASI */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Jelajahi</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/event" className="hover:text-blue-600 transition">Event Musik</Link></li>
              <li><Link href="/destinasi" className="hover:text-blue-600 transition">Wisata Alam</Link></li>
              <li><Link href="/destinasi" className="hover:text-blue-600 transition">Kuliner</Link></li>
              <li><Link href="/kalender-event" className="hover:text-blue-600 transition">Kalender</Link></li>
            </ul>
          </div>

          {/* KOLOM 3: PARTNERSHIP */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Kerjasama</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/register-eo" className="hover:text-blue-600 transition">Daftar sebagai EO</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition">EO Login</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* KOLOM 4: KONTAK */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span>📧</span> support@jokka.id
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span> +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Makassar, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Jokka Indonesia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;