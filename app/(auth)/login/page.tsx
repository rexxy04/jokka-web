'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/public/AuthCard';
import Input from '@/components/ui/input';
import Button from '@/components/ui/Button';
import { loginService } from '@/lib/services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Panggil Service Login
      const result = await loginService(formData.email, formData.password);

      // --- SMART REDIRECT LOGIC ---
      if (result.role === 'admin') {
        // Redirect ke Dashboard Admin
        router.push('/admin/dashboard'); 
      } else if (result.role === 'eo') {
        // Redirect ke Dashboard EO
        router.push('/eo/dashboard');
      } else {
        // User Biasa -> Ke Homepage
        router.push('/');
      }
      
      // (Opsional) Tampilkan notifikasi kecil
      // alert(`Selamat datang, login sebagai ${result.role}`);

    } catch (error: any) {
      alert(error.message); // Tampilkan pesan error (Pending/Salah password dll)
    } finally {
      setLoading(false);
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
            onChange={handleChange}
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-gray-700">
              Ingat saya
            </label>
          </div>

          <div className="text-sm">
            <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Lupa password?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
             <span className="px-2 bg-gray-200/80 text-gray-500">atau</span>
          </div>
        </div>

        {/* Tombol Google (Placeholder) */}
        <div>
          <Button variant="outline" type="button" className="w-full py-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
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
    </AuthCard>
  );
}