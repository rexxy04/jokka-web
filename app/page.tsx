import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturedSection from "../components/home/FeaturedSection";
import Footer from "../components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* 1. Navbar Global */}
      <Navbar />
      
      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Featured Section (Bento Grid) */}
      <FeaturedSection />

      {/* 4. Footer (Bagian paling bawah) */}
      <Footer />

    </main>
  );
}