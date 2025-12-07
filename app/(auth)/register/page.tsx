'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/public/AuthCard';
import Input from '@/components/ui/input';
import Button from '@/components/ui/Button';
// 1. Update Import: Tambahkan loginWithGoogle
import { registerUserService, loginWithGoogle } from '@/lib/services/auth';
import StatusModal from '@/components/ui/StatusModal';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Input
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC DAFTAR EMAIL BIASA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await registerUserService(formData);

      setModalContent({
        title: "Pendaftaran Berhasil! 🎉",
        message: "Akun Anda telah dibuat. Silakan cek email Anda untuk verifikasi sebelum login."
      });
      setIsSuccess(true); 
      setShowModal(true);

    } catch (error: any) {
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

  // --- LOGIC DAFTAR DENGAN GOOGLE (BARU) ---
  const handleGoogleRegister = async () => {
    try {
      // Panggil service Google Login (otomatis register jika belum ada akun)
      const result = await loginWithGoogle();
      
      // Jika berhasil, redirect sesuai role (biasanya ke home untuk user baru)
      if (result.role === 'admin') router.push('/admin/dashboard');
      else if (result.role === 'eo') router.push('/eo/dashboard');
      else router.push('/');
      
    } catch (error: any) {
      setModalContent({ 
        title: "Gagal Mendaftar", 
        message: "Terjadi kesalahan saat mencoba mendaftar dengan Google." 
      });
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  // Handler saat modal ditutup
  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess) {
        router.push('/login'); 
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

        {/* Pemisah UI */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
             <span className="px-2 bg-gray-200/80 text-gray-500">atau</span>
          </div>
        </div>

        {/* Tombol Google (SUDAH DIUPDATE) */}
        <div>
          <Button 
            type="button" // Penting: type button
            onClick={handleGoogleRegister} // Pasang Handler di sini
            variant="outline" 
            className="w-full py-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
          >
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27 3.46 0 6.64 1.9 8.05 3.36l2.37-2.37C20.25 3.38 16.69 2 12.16 2 6.64 2 2 6.64 2 12s4.64 10 10.16 10c7.47 0 10.65-5.1 10.65-10 0-.93-.14-1.46-.35-2.9z"/></svg>
             Daftar dengan Google
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

      {/* Render Modal */}
      <StatusModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={modalContent.title}
        message={modalContent.message}
      />
    </AuthCard>
  );
}