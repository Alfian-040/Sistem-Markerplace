import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useStore } from "../../context/Store";
import Field from "../../components/common/Field";
import { validasiAkun } from "../../utils/validasiAkun";

const formAwal = { nama: "", email: "", password: "", konfirmasi: "" };

function DaftarPembeli() {
  const { db, aksi } = useStore();
  const akun = db.akun;
  const onDaftar = aksi.daftar;
  const [form, setForm] = useState(formAwal);
  const [errors, setErrors] = useState({});
  const [selesai, setSelesai] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasil = validasiAkun(form, akun);
    setErrors(hasil);
    if (Object.keys(hasil).length > 0) return;

    onDaftar({
      id: Date.now(),
      peran: "pembeli",
      status: "aktif",
      nama: form.nama.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
    setSelesai(true);
  };

  if (selesai) {
    return (
      <AuthLayout>
        <div className="form-card sukses">
          <div className="tanda" aria-hidden="true">✓</div>
          <h1>Akun berhasil dibuat</h1>
          <p>Akun pembeli Anda sudah aktif. Silakan masuk untuk mulai berbelanja.</p>
          <Link className="btn btn-primary" to="/masuk">Masuk sekarang</Link>
        </div>
      </AuthLayout>
    );
  }

  const props = { form, errors, onChange: handleChange };

  return (
    <AuthLayout>
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1>Daftar sebagai pembeli</h1>
        <p className="form-intro">Buat akun untuk berbelanja produk UMKM.</p>

        <Field label="Nama lengkap" name="nama" {...props} />
        <Field label="Email" name="email" type="email" {...props} />
        <Field label="Password" name="password" type="password" hint="Minimal 8 karakter." {...props} />
        <Field label="Konfirmasi password" name="konfirmasi" type="password" {...props} />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-block">Buat akun</button>
          <p className="form-note">
            Sudah punya akun? <Link to="/masuk">Masuk</Link>
            {" · "}
            Ingin berjualan? <Link to="/daftar/penjual">Daftar sebagai penjual</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default DaftarPembeli;