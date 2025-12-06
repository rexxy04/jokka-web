import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Script from "next/script"; // <--- Import Wajib

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      
      <main>{children}</main>
      
      <Footer />

      {/* --- MIDTRANS SNAP SCRIPT --- */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </>
  );
}