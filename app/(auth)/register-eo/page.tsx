'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Import Components
import AuthCard from '@/components/public/AuthCard';
import Input from '@/components/ui/input';
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput'; // <--- Komponen Baru

// Import Logic
import { registerEO, EOFormData } from '@/lib/services/eo';

export default function RegisterEOPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Data Teks
  const [formData, setFormData] = useState<EOFormData>({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
    address: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  // State File
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    nib: null,
    tdp: null,
    npwp: null,
    ho: null,
    izinLokasi: null,
  });

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files?.[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) return alert("Password tidak cocok!");
    if (!files.nib || !files.npwp) return alert("Wajib upload NIB dan NPWP!");

    setLoading(true);
    try {
      await registerEO(formData, files);
      alert("Pendaftaran Berhasil! Cek email untuk verifikasi.");
      router.push('/login');
    } catch (error: any) {
      alert("Gagal mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Daftar Partner EO">
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        
        {/* SECTION 1: DATA AKUN */}
        <section className="space-y-4">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Data Organisasi</h3>
          </div>
          
          <Input name="companyName" placeholder="Nama EO / Perusahaan" onChange={handleChange} required />
          <Input name="fullName" placeholder="Nama Penanggung Jawab" onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email Perusahaan" onChange={handleChange} required />
          <Input name="phone" type="tel" placeholder="Nomor WhatsApp" onChange={handleChange} required />
          <Input name="address" placeholder="Alamat Kantor" onChange={handleChange} required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <Input name="confirmPassword" type="password" placeholder="Ulangi Password" onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </section>

        {/* SECTION 2: DOKUMEN */}
        <section className="space-y-4">
          <div className="border-b pb-2 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dokumen Legalitas</h3>
          </div>

          <FileInput label="1. Nomor Induk Berusaha (NIB) *" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'nib')} required />
          <FileInput label="2. Tanda Daftar Perusahaan (TDP)" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'tdp')} />
          <FileInput label="3. NPWP Perusahaan *" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'npwp')} required />
          <FileInput label="4. Izin Gangguan (HO)" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'ho')} />
          <FileInput label="5. Izin Lokasi" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'izinLokasi')} />
        </section>

        {/* ACTION BUTTONS */}
        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Sedang Memproses..." : "Daftar Partner EO"}
          </Button>
          
          <div className="text-sm text-center mt-4">
            <Link href="/register" className="text-blue-600 hover:underline">
              Bukan EO? Daftar sebagai Pengunjung
            </Link>
          </div>
        </div>

      </form>
    </AuthCard>
  );
}