import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturedSection from "../components/home/FeaturedSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar Global */}
      <Navbar />
      
      {/* Hero Section (Search-First) */}
      <HeroSection />

      <FeaturedSection />

      {/* Spacer Sementara (Agar halaman bisa discroll lebih jauh ke bawah) */}
      <div className="h-[30vh] bg-gray-100 flex items-center justify-center border-t border-gray-200">
        <p className="text-gray-400 italic">
          Section selanjutnya: Kategori Wisata & Footer (Coming Soon)
        </p>
      </div>

    </main>
  );
}