import Link from 'next/link';
import Button from '../ui/Button';

const Navbar = () => {
  return (
    // added sticky and glassmorphism effect
    // 1. fixed top-0 w-full z-50 -> Agar menempel di atas
    // 2. bg-white/80 backdrop-blur-md -> Efek Glassmorphism
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <div className="text-2xl font-bold text-blue-600">
            <Link href="/">
              Jokka<span className="text-gray-800">.</span>
            </Link>
          </div>

          {/* Desktop Menu */}
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
            {/* Menggunakan komponen Button*/}
            <Button href="#" variant="primary" className="shadow-none">
              Daftar
            </Button>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-blue-600 focus:outline-none p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;