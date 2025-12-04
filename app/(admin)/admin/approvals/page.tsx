'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
// Import Service
import { getPendingEOs, approveEO, rejectEO, EOData } from '@/lib/services/admin';

export default function ApprovalPage() {
  const [eos, setEos] = useState<EOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch data saat halaman pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getPendingEOs();
    setEos(data); // Simpan data ke state
    setLoading(false);
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menyetujui ${name}? EO ini akan bisa login & buat event.`)) return;
    setProcessingId(id);
    try {
      await approveEO(id);
      alert("EO Berhasil Disetujui! ✅");
      fetchData(); // Refresh tabel agar data yang sudah diapprove hilang
    } catch (error) {
      alert("Gagal memproses approval");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin MENOLAK ${name}?`)) return;
    setProcessingId(id);
    try {
      await rejectEO(id);
      alert("EO Ditolak ❌");
      fetchData();
    } catch (error) {
      alert("Gagal memproses penolakan");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Approval Partner EO 👮‍♂️</h1>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="text-sm py-2">
          🔄 Refresh Data
        </Button>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <p>Sedang mengambil data dari Firebase...</p>
        </div>
      ) : eos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-lg mb-2">Semua Aman! 👍</p>
          <p className="text-gray-500">Tidak ada pendaftaran EO baru yang pending saat ini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penanggung Jawab</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen Legalitas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eos.map((eo) => (
                  <tr key={eo.uid} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{eo.companyName}</div>
                      <div className="text-sm text-gray-500">{eo.email}</div>
                      <div className="text-xs text-gray-400 mt-1">{eo.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{eo.fullName}</div>
                      <div className="text-sm text-gray-500">{eo.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {/* Looping Dokumen */}
                        {eo.documents && Object.entries(eo.documents).map(([key, url]) => (
                          <a 
                            key={key} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center px-2 py-1 rounded border border-gray-200 bg-gray-50 text-xs font-medium text-blue-600 hover:bg-blue-50 transition uppercase"
                          >
                            📄 {key}
                          </a>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApprove(eo.uid, eo.companyName)}
                          variant="primary" 
                          className="bg-green-600 hover:bg-green-700 py-1.5 px-3 text-xs shadow-none"
                          disabled={processingId === eo.uid}
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleReject(eo.uid, eo.companyName)}
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 py-1.5 px-3 text-xs"
                          disabled={processingId === eo.uid}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}