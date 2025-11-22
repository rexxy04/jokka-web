import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        
        {/* Grid Layout: 4 Kolom di Desktop, 1 Kolom di Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Kolom 1: Brand & Deskripsi */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white">
              Jokka<span className="text-blue-500">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Platform informasi wisata dan event terlengkap di Kota Makassar. 
              Temukan pengalaman seru setiap hari.
            </p>
          </div>

          {/* Kolom 2: Navigasi */}
          <div>
            <h3 className="text-white font-semibold mb-4">Jelajahi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#hero" className="hover:text-blue-400 transition">Beranda</Link></li>
              <li><Link href="#pilihan-jokka" className="hover:text-blue-400 transition">Pilihan Editor</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Event Terkini</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Kuliner Legendaris</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div>
            <h3 className="text-white font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Partner Wisata</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Kontak</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Kolom 4: Social Media / Newsletter (Opsional) */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex space-x-4">
              {/* Icon Sosial Media (SVG) */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition">
                {/* Instagram Icon */}
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition">
                {/* Twitter/X Icon */}
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Jokka Indonesia. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition">Privacy</Link>
            <Link href="#" className="hover:text-white transition">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;