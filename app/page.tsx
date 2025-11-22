import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar Global */}
      <Navbar />
      
      {/* Hero Section (Search-First) */}
      <HeroSection />

      {/* Placeholder untuk section selanjutnya */}
      <div id="pilihan-jokka" className="h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Section: Pilihan Jokka (Coming Soon)</p>
      </div>

    </main>
  );
}