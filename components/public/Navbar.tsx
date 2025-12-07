'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '@/lib/firebase'; 
import Button from '@/components/ui/Button'; 

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Khusus untuk Foto Profil (dari Database)
  const [dbPhoto, setDbPhoto] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setDbPhoto(userData.photoURL || currentUser.photoURL);
          } else {
            setDbPhoto(currentUser.photoURL);
          }
        } catch (error) {
          console.error("Gagal ambil foto navbar:", error);
          setDbPhoto(currentUser.photoURL); 
        }
      } else {
        setDbPhoto(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
    setIsOpen(false);
  };

  const getInitials = (name: string | null) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          
          {/* LOGO (Gunakan Image) */}
          <div className="z-50 relative flex items-center">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <div className="relative w-32 h-10">
                <Image 
                  src="/images/logo-jokka.png" // Pastikan path benar
                  alt="Jokka Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* DESKTOP MENU */}
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
            <Link href="/kalender-event" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Kalender Event
            </Link>
          </div>

          {/* AUTH SECTION */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              // JIKA LOGIN
              <Link href="/profile" className="flex items-center gap-3 group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">
                  Halo, {user.displayName?.split(' ')[0] || "User"}
                </span>
                
                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm group-hover:shadow-md transition overflow-hidden">
                  {dbPhoto ? (
                    <img 
                        src={dbPhoto} 
                        alt="Profil" 
                        className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{getInitials(user.displayName)}</span>
                  )}
                </div>
              </Link>
            ) : (
              // JIKA BELUM LOGIN
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition">
                  Masuk
                </Link>
                <Button href="/register" variant="primary" className="shadow-none">
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden z-50 relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col p-4 space-y-4 animate-fadeIn h-screen">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/destinasi" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Destinasi</Link>
          <Link href="/event" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Event</Link>
          <Link href="/kalender-event" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Kalender Event</Link>
          
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-3 py-2 px-3 bg-blue-50 rounded-lg text-blue-800 font-bold" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm overflow-hidden">
                    {dbPhoto ? (
                        <img src={dbPhoto} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                        <span>{getInitials(user.displayName)}</span>
                    )}
                  </div>
                  Profil Saya
                </Link>
                <button onClick={handleLogout} className="text-left text-red-600 font-medium py-2 px-3 hover:bg-red-50 rounded-lg transition">
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-center text-gray-600 font-medium py-2 border border-gray-200 rounded-lg" onClick={() => setIsOpen(false)}>Masuk</Link>
                <Button href="/register" variant="primary" className="w-full justify-center">Daftar Sekarang</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;