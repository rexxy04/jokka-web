import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold text-blue-600">
            Jokka
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600">Home</a>
            <a href="#pilihan-jokka" className="text-gray-600 hover:text-blue-600">Pilihan Jokka</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Tentang Kami</a>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-600">Masuk</a>
            <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Daftar</a>
          </div>
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-blue-600 focus:outline-none">
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
