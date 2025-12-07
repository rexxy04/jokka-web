'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Button from '@/components/ui/Button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/Modal'; 
import StatusModal from '@/components/ui/StatusModal'; 
// 1. IMPORT CONFIRM MODAL
import ConfirmModal from '@/components/ui/ConfirmModal'; 

// Services
import { getUserTransactions, Transaction } from '@/lib/services/transaction';
import { getUserWishlist, WishlistItem } from '@/lib/services/wishlist';
import { 
  updateUserData, 
  changeUserPassword, 
  sendResetPasswordLink,
  updateUserProfileImage
} from '@/lib/services/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Data Akun & Edit
  const [userDataFirestore, setUserDataFirestore] = useState<any>(null);
  const [phoneInput, setPhoneInput] = useState(''); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loadingSaveProfile, setLoadingSaveProfile] = useState(false);

  // Upload Foto
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Data Password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [loadingPass, setLoadingPass] = useState(false);

  // Data Tiket & Wishlist
  const [tickets, setTickets] = useState<Transaction[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // State Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);


  const [statusModalContent, setStatusModalContent] = useState<{
    title: string;
    message: string;
    type?: 'success' | 'error'; // Kita tambahkan definisi type di sini
  }>({ 
    title: '', 
    message: '', 
    type: 'success' 
  });

  
  const [onModalCloseAction, setOnModalCloseAction] = useState<(() => void) | null>(null);

  // 2. STATE UNTUK CONFIRM MODAL (LOGOUT)
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserDataFirestore(data);
          setPhoneInput(data.phone || ''); 
        }

        const myTickets = await getUserTransactions(currentUser.uid);
        setTickets(myTickets);

        const myWishlist = await getUserWishlist(currentUser.uid);
        setWishlist(myWishlist);
        
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 3. LOGIC LOGOUT DIGANTI
  const handleLogoutClick = () => {
      setShowLogoutModal(true); // Munculkan modal confirm
  };

  const confirmLogout = async () => {
      await signOut(auth);
      router.push('/');
  };

  const getStatusColor = (status: string) => {
    if (status === 'settlement' || status === 'capture') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  // --- LOGIC GANTI FOTO ---
// --- LOGIC GANTI FOTO ---
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 1. Validasi Ukuran
      if (file.size > 2 * 1024 * 1024) {
        setStatusModalContent({ 
            title: "Gagal Upload", 
            message: "Ukuran foto terlalu besar! Maksimal 2MB.", 
            type: 'error' // Icon Merah
        });
        setShowStatusModal(true);
        return;
      }

      setUploadingPhoto(true);
      try {
        const res = await updateUserProfileImage(user, file);
        
        // 2. SUKSES: Set pesan & Action Reload
        setStatusModalContent({ 
            title: "Berhasil! 📸", 
            message: "Foto profil berhasil diperbarui. Halaman akan dimuat ulang.", 
            type: 'success' // Icon Hijau
        });
        
        // 🔥 SOLUSI NAVBAR: Reload halaman setelah modal ditutup
        setOnModalCloseAction(() => () => {
            window.location.reload(); 
        });
        
        setShowStatusModal(true);
        setUser({ ...user, photoURL: res.photoURL });
        
      } catch (error: any) {
        // 3. GAGAL: Tampilkan error
        setStatusModalContent({ 
            title: "Gagal Upload", 
            message: error.message, 
            type: 'error' // Icon Merah
        });
        setShowStatusModal(true);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  // --- LOGIC SIMPAN PROFIL ---
  const handleSaveProfile = async () => {
    if (!user) return;
    setLoadingSaveProfile(true);
    try {
      await updateUserData(user.uid, { phone: phoneInput });
      setStatusModalContent({ title: "Data Disimpan ✅", message: "Informasi profil berhasil diperbarui." });
      setShowStatusModal(true);
      setIsEditingProfile(false);
      setUserDataFirestore({ ...userDataFirestore, phone: phoneInput });
    } catch (error: any) {
      setStatusModalContent({ title: "Gagal Menyimpan", message: error.message });
      setShowStatusModal(true);
    } finally {
      setLoadingSaveProfile(false);
    }
  };

  // --- LOGIC GANTI PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
        setStatusModalContent({ title: "Validasi Gagal", message: "Konfirmasi password baru tidak cocok!" });
        setShowStatusModal(true);
        return;
    }
    setLoadingPass(true);
    try {
      await changeUserPassword(user, passForm.current, passForm.new);
      setIsPasswordModalOpen(false);
      setStatusModalContent({ title: "Password Berubah 🔒", message: "Password berhasil diubah! Silakan login ulang." });
      setOnModalCloseAction(() => async () => {
         await signOut(auth);
         router.push('/login');
      });
      setShowStatusModal(true);
    } catch (error: any) {
      setStatusModalContent({ title: "Gagal Ganti Password", message: error.message });
      setShowStatusModal(true);
    } finally {
      setLoadingPass(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    try {
      await sendResetPasswordLink(user.email);
      setStatusModalContent({ title: "Email Terkirim 📧", message: `Link reset password telah dikirim ke ${user.email}.` });
      setShowStatusModal(true);
    } catch (error: any) {
      setStatusModalContent({ title: "Gagal", message: "Gagal mengirim email reset password." });
      setShowStatusModal(true);
    }
  };

  const handleCloseStatusModal = () => {
      setShowStatusModal(false);
      if (onModalCloseAction) {
          onModalCloseAction();
          setOnModalCloseAction(null);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat profil...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              {/* Foto Profil */}
              <div 
                onClick={handlePhotoClick}
                className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 overflow-hidden relative group cursor-pointer border-4 ${uploadingPhoto ? 'border-blue-400 animate-pulse' : 'border-gray-100'}`}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                    {user?.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-medium">
                  {uploadingPhoto ? "Uploading..." : "Ganti Foto"}
                </div>
              </div>

              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

              <h2 className="text-xl font-bold text-gray-900">{user?.displayName}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <Button onClick={() => setIsPasswordModalOpen(true)} variant="outline" className="w-full justify-center text-sm">
                🔒 Ganti Password
              </Button>
              {/* TOMBOL LOGOUT MENGARAH KE MODAL */}
              <Button onClick={handleLogoutClick} variant="outline" className="w-full justify-center text-sm text-red-600 border-red-200 hover:bg-red-50">
                🚪 Keluar
              </Button>
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="md:col-span-2 space-y-8">
            {/* DATA AKUN */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Data Akun</h3>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="text-blue-600 text-sm font-semibold hover:underline">Edit Data</button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditingProfile(false)} className="text-gray-500 text-sm hover:underline">Batal</button>
                    <button onClick={handleSaveProfile} disabled={loadingSaveProfile} className="text-blue-600 text-sm font-bold hover:underline">
                      {loadingSaveProfile ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
                  <Input value={user?.displayName || ''} disabled className="bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                  <Input value={userDataFirestore?.username || '-'} disabled className="bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <Input value={user?.email || ''} disabled className="bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Telepon</label>
                  <Input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} disabled={!isEditingProfile} className={isEditingProfile ? "bg-white border-blue-300 ring-2 ring-blue-100" : "bg-gray-50"} placeholder="08..." />
                </div>
              </div>
            </section>

            {/* TIKET SAYA */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Tiket Saya 🎫</h3>
              {tickets.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">Belum ada tiket.</div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'settlement' ? 'LUNAS' : ticket.status}
                          </span>
                          <span className="text-xs text-gray-400">#{ticket.orderId}</span>
                        </div>
                        <h4 className="font-bold text-lg text-gray-900">{ticket.eventName}</h4>
                      </div>
                      {ticket.status === 'pending' && (
                        <Button href={`https://app.sandbox.midtrans.com/snap/v3/redirection/${ticket.id}`} variant="primary" className="text-sm bg-yellow-500 border-0">Bayar</Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* WISHLIST */}
            <section>
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg font-bold text-gray-900">Disimpan / Wishlist ❤️</h3>
                <Link href="/destinasi" className="text-sm text-blue-600 hover:underline">Tambah lagi</Link>
              </div>
              {wishlist.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">Belum ada item disimpan. Yuk cari tempat seru!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} title={item.title} category={item.category} image={item.image} href={item.itemType === 'event' ? `/event/${item.itemId}` : `/destinasi/${item.itemId}`} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Modal Ganti Password */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Ganti Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input type="password" placeholder="Password Saat Ini" label="Password Lama" value={passForm.current} onChange={(e) => setPassForm({...passForm, current: e.target.value})} required />
          <Input type="password" placeholder="Password Baru" label="Password Baru" value={passForm.new} onChange={(e) => setPassForm({...passForm, new: e.target.value})} required />
          <Input type="password" placeholder="Ulangi Password Baru" label="Konfirmasi Password Baru" value={passForm.confirm} onChange={(e) => setPassForm({...passForm, confirm: e.target.value})} required />
          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full justify-center" disabled={loadingPass}>{loadingPass ? "Memproses..." : "Ganti Password"}</Button>
          </div>
          <div className="text-center pt-2">
            <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600 hover:underline">Lupa password saat ini? Kirim link reset</button>
          </div>
        </form>
      </Modal>

      {/* Status Modal (Success/Error) */}
      <StatusModal isOpen={showStatusModal} onClose={handleCloseStatusModal} title={statusModalContent.title} message={statusModalContent.message} />

      {/* 4. RENDER CONFIRM MODAL UNTUK LOGOUT */}
      <ConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        isDanger={true}
      />

    </main>
  );
}