import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useStore } from "../../context/Store";
import Field from "../../components/common/Field";
import { validasiAkun } from "../../utils/validasiAkun";

const formAwal = {
  nama: "",
  email: "",
  password: "",
  konfirmasi: "",
  namaToko: "",
  telepon: "",
  alamat: "",
  deskripsi: "",
};

const validasiToko = (form) => {
  const e = {};
  if (!form.namaToko.trim()) e.namaToko = "Nama toko wajib diisi.";
  if (!/^(\+62|62|0)8[0-9]{8,12}$/.test(form.telepon.replace(/[\s-]/g, "")))
    e.telepon = "Nomor telepon tidak valid, contoh 081234567890.";
  if (!form.alamat.trim()) e.alamat = "Alamat toko wajib diisi.";
  return e;
};

// Pembungkus ikon garis (gaya sama dengan ikon keranjang di Navbar)
const Ikon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

// Teks promosi di sisi kiri halaman Daftar penjual
const PROMO = {
  judul: "Saatnya UMKM Naik Kelas!",
  intro: "Kembangkan bisnismu bersama LOKALO dan jangkau lebih banyak pelanggan.",
  poin: [
    {
      ikon: (
        <Ikon>
          <path d="M3 10l1.5-6h15L21 10" />
          <path d="M3 10a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0" />
          <path d="M5 13v7h14v-7" />
          <path d="M10 20v-4h4v4" />
        </Ikon>
      ),
      judul: "Buka Toko Gratis",
      teks: "Mulai jualan online dengan mudah tanpa biaya pendaftaran toko.",
    },
    {
      ikon: (
        <Ikon>
          <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </Ikon>
      ),
      judul: "Dukungan untuk UMKM",
      teks: "Dapatkan kesempatan untuk mengembangkan usaha dan meningkatkan penjualan.",
    },
    {
      ikon: (
        <Ikon>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </Ikon>
      ),
      judul: "Perluas Pasar, Tingkatkan Penjualan",
      teks: "Jangkau lebih banyak pembeli dan buat produk lokal semakin dikenal.",
    },
    {
      ikon: (
        <Ikon>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M17 14c2.5 0 4.5 2 4.5 5" />
        </Ikon>
      ),
      judul: "Tumbuh Bersama LOKALO",
      teks: "Jadikan produk lokal lebih mudah ditemukan dan dipercaya pelanggan.",
    },
  ],
};

const Promo = () => (
  <div className="promo">
    <h2 className="promo-judul">{PROMO.judul}</h2>
    <p className="promo-intro">{PROMO.intro}</p>
    <ul className="promo-daftar">
      {PROMO.poin.map((p) => (
        <li key={p.judul}>
          <span className="promo-ikon">{p.ikon}</span>
          <div>
            <strong className="promo-poin-judul">{p.judul}</strong>
            <p className="promo-poin-teks">{p.teks}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

function DaftarPenjual() {
  const { db, aksi } = useStore();
  const akun = db.akun;
  const onDaftar = aksi.daftar;
  const [form, setForm] = useState(formAwal);
  const [errors, setErrors] = useState({});
  const [terdaftar, setTerdaftar] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasil = { ...validasiAkun(form, akun), ...validasiToko(form) };
    setErrors(hasil);
    if (Object.keys(hasil).length > 0) return;

    const akunBaru = {
      id: Date.now(),
      peran: "penjual",
      status: "menunggu", // aktif setelah disetujui pemilik (FR-04)
      nama: form.nama.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      namaToko: form.namaToko.trim(),
      telepon: form.telepon.trim(),
      alamat: form.alamat.trim(),
      deskripsi: form.deskripsi.trim(),
    };
    onDaftar(akunBaru);
    setTerdaftar(akunBaru);
  };

  if (terdaftar) {
    return (
      <AuthLayout kiri={<Promo />} kelas="auth-penjual">
        <div className="form-card sukses">
          <div className="tanda" aria-hidden="true">✓</div>
          <h1>Pendaftaran terkirim</h1>
          <p>
            Toko <strong>{terdaftar.namaToko}</strong> ({terdaftar.email}) menunggu persetujuan pemilik
            marketplace. Anda baru bisa masuk setelah akun disetujui.
          </p>
          <Link className="btn btn-primary" to="/">Kembali ke Beranda</Link>
        </div>
      </AuthLayout>
    );
  }

  const props = { form, errors, onChange: handleChange };

  return (
    <AuthLayout kiri={<Promo />} kelas="auth-penjual">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1>Daftar sebagai penjual</h1>
        <p className="form-intro">Buka toko Anda di LOKALO. Pendaftaran akan diperiksa pemilik marketplace lebih dulu.</p>

        <h2 className="form-section">Akun</h2>
        <Field label="Nama pemilik toko" name="nama" {...props} />
        <Field label="Email" name="email" type="email" {...props} />
        <Field label="Password" name="password" type="password" hint="Minimal 8 karakter." {...props} />
        <Field label="Konfirmasi password" name="konfirmasi" type="password" {...props} />

        <h2 className="form-section">Toko</h2>
        <Field label="Nama toko" name="namaToko" {...props} />
        <Field label="Nomor telepon / WhatsApp" name="telepon" type="tel" {...props} />
        <Field label="Alamat toko" name="alamat" area {...props} />
        <Field label="Deskripsi toko (opsional)" name="deskripsi" area {...props} />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-block">Kirim pendaftaran</button>
          <p className="form-note">
            Sudah punya akun? <Link to="/masuk">Masuk</Link>
            {" · "}
            Ingin berbelanja? <Link to="/daftar/pembeli">Daftar sebagai pembeli</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default DaftarPenjual;