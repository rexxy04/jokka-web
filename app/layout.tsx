import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Jokka Web",
  description: "Jelajahi keindahan kota dan event seru",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth"> 
      {/* scroll-smooth agar saat klik link anchor (misal #hero) gerakannya halus */}
      <body className={`${poppins.variable} font-sans antialiased bg-gray-50`}>
        
        {/* 1. Navbar selalu di atas */}
        <Navbar />
        
        {/* 2. Konten halaman (Page.tsx) dirender di sini */}
        {children}

        {/* 3. Footer selalu di bawah */}
        <Footer />
        
      </body>
    </html>
  );
}