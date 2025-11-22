import React from 'react';
import Link from 'next/link';
import AuthCard from '@/components/layout/AuthCard';
import Input from '@/components/ui/input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  return (
    <AuthCard title="Daftar Akun">
      <form className="mt-8 space-y-4">
        <div className="space-y-4">
          <Input
            id="fullname"
            name="fullname"
            type="text"
            placeholder="Nama Lengkap"
            required
          />
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="Konfirmasi Password"
            required
          />
        </div>

        <div className="pt-4">
          {/* Tombol Daftar (Pakai warna Primary Jokka/Biru) */}
          <Button type="submit" variant="primary" className="w-full py-3">
            Daftar
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

        <div>
          {/* Tombol Google (Kita pakai variant outline agar bersih) */}
          <Button variant="outline" className="w-full py-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            {/* Placeholder Icon Google */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.16-7.27 3.46 0 6.64 1.9 8.05 3.36l2.37-2.37C20.25 3.38 16.69 2 12.16 2 6.64 2 2 6.64 2 12s4.64 10 10.16 10c7.47 0 10.65-5.1 10.65-10 0-.93-.14-1.46-.35-2.9z"/></svg>
            Daftar dengan Google
          </Button>
        </div>

        <div className="text-sm text-center mt-6">
          <span className="text-gray-600">Sudah punya akun? </span>
          {/* Link ke Login */}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
            Masuk di sini
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}