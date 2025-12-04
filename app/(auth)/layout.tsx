import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrapper sederhana untuk group Auth
    // Kita beri background gray-50 agar konsisten jika ada bagian yang tidak tertutup AuthCard
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}