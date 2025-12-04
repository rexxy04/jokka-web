'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
// Import Service
import { getPendingEOs, approveEO, rejectEO, EOData } from '@/lib/services/admin';

export default function ApprovalPage() {
  const [eos, setEos] = useState<EOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch data saat halaman dibuka
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getPendingEOs();
    setEos(data);
    setLoading(false);
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menyetujui ${name}?`)) return;
    setProcessingId(id);
    try {
      await approveEO(id);
      alert("EO Berhasil Disetujui! ✅");
      fetchData(); // Refresh data
    } catch (error) {
      alert("Gagal memproses");
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
      alert("Gagal memproses");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Approval Partner EO 👮‍♂️</h1>
      
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : eos.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Tidak ada pendaftaran EO baru yang pending.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama EO / PT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penanggung Jawab</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eos.map((eo) => (
                <tr key={eo.uid}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{eo.companyName}</div>
                    <div className="text-sm text-gray-500">{eo.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{eo.fullName}</div>
                    <div className="text-sm text-gray-500">{eo.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <div className="flex flex-col gap-1">
                      {/* Tampilkan Link Dokumen */}
                      {Object.entries(eo.documents).map(([key, url]) => (
                        <a key={key} href={url} target="_blank" rel="noreferrer" className="hover:underline uppercase text-xs">
                          📄 Lihat {key}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(eo.uid, eo.companyName)}
                        variant="primary" 
                        className="bg-green-600 hover:bg-green-700 py-1 px-3 text-xs"
                        disabled={processingId === eo.uid}
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject(eo.uid, eo.companyName)}
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50 py-1 px-3 text-xs"
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
      )}
    </div>
  );
}