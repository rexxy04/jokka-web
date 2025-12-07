// components/search/EmptySearch.tsx
import React from 'react';
import Link from 'next/link';

const EmptySearch = ({ query }: { query: string }) => {
  return (
    <div className="container mx-auto px-4 text-center">
      <div className="max-w-md mx-auto bg-white p-10 rounded-3xl border border-dashed border-gray-200">
        <div className="text-6xl mb-4">🤔</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tidak ditemukan hasil untuk "{query}"
        </h2>
        <p className="text-gray-500 text-sm">
          Coba gunakan kata kunci lain seperti "Pantai", "Musik", atau nama tempat.
        </p>
        <Link href="/" className="inline-block mt-6 text-blue-600 font-semibold hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default EmptySearch;