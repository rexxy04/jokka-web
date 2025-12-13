'use client';

import React from 'react';

interface PlaceSidebarProps {
  price?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

const PlaceSidebar: React.FC<PlaceSidebarProps> = ({
  price,
  location,
  lat,
  lng
}) => {
  
  // Logic URL Peta (Format HTTPS standar agar tidak 404)
  let mapSrc = "";
  if (lat && lng) {
    mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=15&output=embed`;
  } else if (location) {
    const cleanLoc = location.trim();
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(cleanLoc)}&hl=id&z=15&output=embed`;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
      
      {/* SECTION 1: INFO HARGA */}
      <div className="mb-6">
         {/* JUDUL UTAMA: INFORMASI HARGA */}
         <h3 className="font-bold text-gray-900 mb-4 text-lg">Informasi Harga</h3>
         
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            
            {/* Teks Harga Besar */}
            <div className="text-3xl font-extrabold text-blue-600">
              {price ? (
                price === "0" || price.toLowerCase() === "gratis" ? "Gratis" : 
                price.startsWith("Rp") ? price : `Rp ${price}`
              ) : (
                <span className="text-gray-400 text-lg">Gratis / Belum ada info</span>
              )}
            </div>
            
            {/* Disclaimer Kecil */}
            <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100 italic">
              *Harga bayar di tempat (OTS). Dapat berubah sewaktu-waktu sesuai kebijakan pengelola.
            </p>
         </div>
      </div>

      {/* SECTION 2: PETA LOKASI */}
      {mapSrc ? (
        <div className="mt-6 pt-6 border-t border-gray-200">
           <h4 className="text-sm font-bold text-gray-700 mb-3">Lokasi Peta</h4>
           <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white relative">
              <div className="w-full h-[250px] bg-gray-100">
                <iframe
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc}
                  title="Lokasi Peta"
                ></iframe>
              </div>
              <a 
                 href={mapSrc.replace("&output=embed", "")} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block text-center py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition border-t border-gray-100"
              >
                 📍 Buka di Google Maps
              </a>
           </div>
        </div>
      ) : (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
           <div className="p-4 bg-gray-100 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs">
             🚫 Lokasi peta belum diatur.
           </div>
        </div>
      )}

    </div>
  );
};

export default PlaceSidebar;