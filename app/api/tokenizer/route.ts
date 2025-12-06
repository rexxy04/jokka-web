import { NextRequest, NextResponse } from 'next/server';
import Midtrans from 'midtrans-client';

// Inisialisasi Snap Client (Jembatan ke Midtrans)
const snap = new Midtrans.Snap({
  isProduction: false, // Ganti true jika nanti sudah live production
  serverKey: process.env.MIDTRANS_SERVER_KEY || "", // Ambil dari .env.local
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
});

export async function POST(request: NextRequest) {
  try {
    // 1. Terima data pesanan dari Frontend
    // Data yang dikirim: { id, productName, price, quantity, buyerName, buyerEmail }
    const body = await request.json();
    
    const { id, productName, price, quantity, buyerName, buyerEmail, buyerPhone } = body;

    // 2. Susun Parameter sesuai format Midtrans
    const parameter = {
      // Detail Transaksi (Wajib)
      transaction_details: {
        order_id: id, // ID unik dari kita (misal: TRX-1748239)
        gross_amount: price * quantity // Total harga
      },
      // Detail Item (Opsional tapi bagus buat invoice user)
      item_details: [
        {
          id: `ITEM-${Date.now()}`,
          price: price,
          quantity: quantity,
          name: productName.substring(0, 50) // Midtrans batasi panjang nama
        }
      ],
      // Data Pembeli (Biar auto-fill di pop-up Midtrans)
      customer_details: {
        first_name: buyerName,
        email: buyerEmail,
        phone: buyerPhone || ""
      }
    };

    // 3. Minta Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    // transaction.token adalah "kunci" untuk membuka pop-up bayar
    const token = transaction.token;

    // 4. Kirim Token balik ke Frontend
    return NextResponse.json({ token });

  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran" },
      { status: 500 }
    );
  }
}