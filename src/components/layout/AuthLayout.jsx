import { useState } from "react";

// Ganti jika nama atau format file logo Anda berbeda (file ada di folder public/)
const LOGO = "/logo-lokalo.png";

// Tata letak halaman Masuk dan Daftar: sisi kiri (logo, atau isi `kiri` jika diberikan), form di kanan
export default function AuthLayout({ children, kiri, kelas = "" }) {
  const [gagal, setGagal] = useState(false);

  return (
    <section className={`auth-wrap ${kelas}`}>
      <div className="auth-kiri">
        {kiri ??
          (gagal ? (
            <span className="auth-logo-teks">LOKALO</span>
          ) : (
            <img className="auth-logo" src={LOGO} alt="LOKALO - Marketplace Produk UMKM Lokal" onError={() => setGagal(true)} />
          ))}
      </div>
      <div className="auth-kanan">{children}</div>
    </section>
  );
}