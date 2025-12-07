'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/public/AuthCard';
import Input from '@/components/ui/input';
import Button from '@/components/ui/Button';
import { loginService, loginWithGoogle, sendResetPasswordLink } from '@/lib/services/auth';
import StatusModal from '@/components/ui/StatusModal';
import Modal from '@/components/ui/Modal'; // 1. Import Modal Generik

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Login
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State Status Modal (Notifikasi)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, message: string, type: 'success' | 'error'}>({ 
    title: '', message: '', type: 'success' 
  });

  // 2. State Lupa Password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loadingForgot, setLoadingForgot] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRedirect = (role: string) => {
    if (role === 'admin') router.push('/admin/dashboard'); 
    else if (role === 'eo') router.push('/eo/dashboard');
    else router.push('/');
  };

  // --- LOGIC LOGIN UTAMA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginService(formData.email, formData.password);
      handleRedirect(result.role);
    } catch (error: any) {
      setModalContent({
        title: "Login Gagal",
        message: error.message || "Periksa kembali email dan password Anda.",
        type: 'error'
      });
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LOGIN GOOGLE ---
  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      handleRedirect(result.role);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      setModalContent({ 
        title: "Gagal Masuk", 
        message: "Terjadi kesalahan saat mencoba masuk dengan Google.",
        type: 'error'
      });
      setShowStatusModal(true);
    }
  };

  // --- LOGIC LUPA PASSWORD (SUBMIT) ---
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForgot(true);

    try {
      await sendResetPasswordLink(forgotEmail);
      
      // Tutup modal form
      setShowForgotModal(false);
      
      // Tampilkan notifikasi sukses
      setModalContent({
        title: "Email Terkirim! 📧",
        message: `Link reset password telah dikirim ke ${forgotEmail}. Silakan cek inbox atau folder spam Anda.`,
        type: 'success'
      });
      setShowStatusModal(true);
      setForgotEmail(''); // Reset field

    } catch (error: any) {
      // Tetap buka modal form, tapi tampilkan alert (opsional, atau pakai status modal juga)
      // Disini saya pilih tutup modal form dan tampilkan error di status modal
      setShowForgotModal(false);
      setModalContent({
        title: "Gagal Mengirim",
        message: error.message,
        type: 'error'
      });
      setShowStatusModal(true);
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <AuthCard title="Masuk Akun">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="remember-me" className="ml-2 block text-gray-700">Ingat saya</label>
          </div>
          
          <div className="text-sm">
            {/* 3. UBAH LINK JADI TOMBOL PEMICU MODAL */}
            <button 
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Lupa password?
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Sedang Memproses..." : "Masuk"}
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-200/80 text-gray-500">atau</span></div>
        </div>

        <div>
          <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full py-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27 3.46 0 6.64 1.9 8.05 3.36l2.37-2.37C20.25 3.38 16.69 2 12.16 2 6.64 2 2 6.64 2 12s4.64 10 10.16 10c7.47 0 10.65-5.1 10.65-10 0-.93-.14-1.46-.35-2.9z"/></svg>
            Masuk dengan Google
          </Button>
        </div>

        <div className="text-sm text-center mt-6">
          <span className="text-gray-600">Belum punya akun? </span>
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
            Daftar di sini
          </Link>
        </div>
      </form>

      {/* --- 4. MODAL LUPA PASSWORD (FORM) --- */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Password"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password Anda.
          </p>
          <Input 
            type="email" 
            placeholder="Contoh: user@email.com" 
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            label="Email Akun"
          />
          <div className="pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center" 
              disabled={loadingForgot}
            >
              {loadingForgot ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- STATUS MODAL (NOTIFIKASI) --- */}
      <StatusModal 
        isOpen={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </AuthCard>
  );
}