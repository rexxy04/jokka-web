'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/public/AuthCard';
import Input from '@/components/ui/input';
import Button from '@/components/ui/Button';
// Import Service Logic
import { registerUserService } from '@/lib/services/auth';
// 1. Import StatusModal
import StatusModal from '@/components/ui/StatusModal';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State untuk menampung input user
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 2. State untuk Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false); // Penanda untuk redirect

  // Handle ketikan user
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic saat tombol Daftar diklik
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Password (Ganti alert jadi Modal)
    if (formData.password !== formData.confirmPassword) {
      setModalContent({
        title: "Password Tidak Cocok",
        message: "Pastikan password dan konfirmasi password Anda sama."
      });
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setLoading(true);

    try {
      // Panggil Service Backend
      await registerUserService(formData);

      // Jika sukses (Ganti alert jadi Modal):
      setModalContent({
        title: "Pendaftaran Berhasil! 🎉",
        message: "Akun Anda telah dibuat. Silakan cek email Anda untuk verifikasi sebelum login."
      });
      setIsSuccess(true); // Set true agar saat modal ditutup user diarahkan ke login
      setShowModal(true);

    } catch (error: any) {
      // Jika gagal (Ganti alert jadi Modal):
      setModalContent({
        title: "Gagal Mendaftar",
        message: error.message || "Terjadi kesalahan saat mendaftarkan akun."
      });
      setIsSuccess(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Handler saat modal ditutup
  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess) {
        router.push('/login'); // Redirect ke login setelah sukses
    }
  };

  return (
    <AuthCard title="Daftar Akun">
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-4">
          <Input
            name="fullname"
            placeholder="Nama Lengkap"
            onChange={handleChange}
            required
          />
          <Input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Konfirmasi Password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="pt-4">
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Sedang Mendaftar..." : "Daftar"}
          </Button>
        </div>

        {/* ... Bagian Google Button (Placeholder) ... */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
             <span className="px-2 bg-gray-200/80 text-gray-500">atau</span>
          </div>
        </div>
        <div>
          <Button type="button" variant="outline" className="w-full py-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
             Daftar dengan Google (Segera)
          </Button>
        </div>

        {/* Footer Link */}
        <div className="text-sm text-center mt-6">
          <div className="mb-4">
            <span className="text-gray-600">Sudah punya akun? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
              Masuk di sini
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-300/50">
            <p className="text-gray-500 text-xs mb-1">Ingin menyelenggarakan event?</p>
            <Link 
              href="/register-eo" 
              className="font-bold text-xs text-indigo-600 hover:text-indigo-500 transition uppercase tracking-wide border border-indigo-100 bg-indigo-50 px-3 py-2 rounded-lg inline-block hover:bg-indigo-100"
            >
              Daftar sebagai Partner EO 🚀
            </Link>
          </div>
        </div>
      </form>

      {/* 3. Render Modal */}
      <StatusModal 
        isOpen={showModal} 
        onClose={handleCloseModal} // Pakai handler khusus untuk redirect
        title={modalContent.title}
        message={modalContent.message}
      />
    </AuthCard>
  );
}