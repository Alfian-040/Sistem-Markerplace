import { useState } from "react";
import { Link } from "react-router-dom";
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
      <section className="form-page">
        <div className="form-card sukses">
          <div className="tanda" aria-hidden="true">✓</div>
          <h1>Pendaftaran terkirim</h1>
          <p>
            Toko <strong>{terdaftar.namaToko}</strong> ({terdaftar.email}) menunggu persetujuan pemilik
            marketplace. Anda baru bisa masuk setelah akun disetujui.
          </p>
          <Link className="btn btn-primary" to="/">Kembali ke Beranda</Link>
        </div>
      </section>
    );
  }

  const props = { form, errors, onChange: handleChange };

  return (
    <section className="form-page">
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
          <p className="form-note">Sudah punya akun? <Link to="/masuk">Masuk</Link></p>
        </div>
      </form>
    </section>
  );
}

export default DaftarPenjual;
