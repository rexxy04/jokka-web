'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input'; // Pakai Input kita untuk search
import { getAllPlaces, deletePlace } from '@/lib/services/admin';

// List Bulan untuk Filter
const MONTHS = [
  "Semua Bulan", "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function ManageWisataPage() {
  const [places, setPlaces] = useState<any[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('0'); // 0 = Semua
  const [filterYear, setFilterYear] = useState('');

  // Fetch Data Awal
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllPlaces();
    // Urutkan dari yang terbaru (descending)
    data.sort((a, b) => {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date();
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date();
      return dateB.getTime() - dateA.getTime();
    });
    setPlaces(data);
    setFilteredPlaces(data);
    setLoading(false);
  };

  // Logic Filtering (Search + Date)
  useEffect(() => {
    let result = places;

    // 1. Filter Search (Nama)
    if (searchQuery) {
      result = result.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Filter Bulan
    if (filterMonth !== '0') {
      result = result.filter(place => {
        if (!place.createdAt) return false;
        // Konversi Timestamp Firestore ke Date JS
        const date = new Date(place.createdAt.seconds * 1000);
        // getMonth() return 0-11, jadi kita cocokkan dengan index dropdown (1-12)
        return date.getMonth() + 1 === parseInt(filterMonth);
      });
    }

    // 3. Filter Tahun
    if (filterYear) {
      result = result.filter(place => {
        if (!place.createdAt) return false;
        const date = new Date(place.createdAt.seconds * 1000);
        return date.getFullYear().toString() === filterYear;
      });
    }

    setFilteredPlaces(result);
  }, [searchQuery, filterMonth, filterYear, places]);

  // Handle Hapus
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus wisata "${name}" permanen?`)) {
      await deletePlace(id);
      fetchData(); // Refresh data
    }
  };

  // Helper Format Tanggal
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Wisata 🏖️</h1>
          <p className="text-gray-500 mt-1">Total {filteredPlaces.length} destinasi ditemukan.</p>
        </div>
        <Button href="/admin/manage-wisata/add" variant="primary" className="shadow-lg">
          + Tambah Wisata
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        
        {/* Search */}
        <div className="flex-1">
          <Input 
            placeholder="Cari nama wisata..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter Bulan */}
        <div className="w-full md:w-48">
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700"
          >
            {MONTHS.map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>
        </div>

        {/* Filter Tahun */}
        <div className="w-full md:w-32">
          <input 
            type="number" 
            placeholder="Tahun" 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wisata</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Upload</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data wisata yang cocok.
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => (
                  <tr key={place.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img className="h-12 w-12 object-cover" src={place.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{place.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            ⭐ {place.rating} • {place.location || "Makassar"}
                          </div>
                        </div>
                      </div>
                    </td>


                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                        {place.category}
                      </span>
                    </td>


                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(place.createdAt)}
                    </td>


                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* Tombol Lihat Public */}
                        <Link href={`/destinasi/${place.id}`} target="_blank" className="text-gray-500 hover:text-gray-700 hover:underline text-xs bg-gray-100 px-2 py-1 rounded">
                          Lihat
                        </Link>
                        
                        {/* --- TOMBOL EDIT BARU --- */}
                        <Link 
                          href={`/admin/manage-wisata/edit/${place.id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline text-xs bg-blue-50 px-2 py-1 rounded"
                        >
                          Edit
                        </Link>
                        {/* ------------------------- */}

                        {/* Tombol Hapus */}
                        <button 
                          onClick={() => handleDelete(place.id, place.name)}
                          className="text-red-600 hover:text-red-800 hover:underline text-xs bg-red-50 px-2 py-1 rounded"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>

                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}