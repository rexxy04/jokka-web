'use client';

import React, { useEffect, useState } from 'react';
import { getVerifiedEOs, EOData } from '@/lib/services/admin';

export default function PartnerEOPage() {
  const [partners, setPartners] = useState<EOData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getVerifiedEOs();
      setPartners(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Partner EO Resmi 🤝</h1>
        <div className="text-sm text-gray-500">Total: {partners.length} Partner</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perusahaan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penanggung Jawab</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bergabung Sejak</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada partner EO verified.</td></tr>
            ) : (
              partners.map((eo) => (
                <tr key={eo.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{eo.companyName}</div>
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1">Verified</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{eo.fullName}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{eo.email}</div>
                    <div className="text-sm text-gray-500">{eo.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {/* Handle timestamp firebase */}
                    {eo.createdAt?.seconds ? new Date(eo.createdAt.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}