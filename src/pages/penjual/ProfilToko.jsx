import { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../../components/common/Field";
import { useStore } from "../../context/Store";

const REGEX_HP = /^(\+62|62|0)8[0-9]{8,12}$/;

export default function ProfilToko() {
  const { pengguna, aksi } = useStore();
  const [form, setForm] = useState({
    namaToko: pengguna.namaToko || "",
    telepon: pengguna.telepon || "",
    alamat: pengguna.alamat || "",
    deskripsi: pengguna.deskripsi || "",
  });
  const [errors, setErrors] = useState({});
  const [pesan, setPesan] = useState("");

  const ubah = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((x) => ({ ...x, [name]: undefined }));
    setPesan("");
  };

  const simpan = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.namaToko.trim()) er.namaToko = "Nama toko wajib diisi.";
    if (!REGEX_HP.test(form.telepon.replace(/[\s-]/g, "")))
      er.telepon = "Nomor telepon tidak valid, contoh 081234567890.";
    if (!form.alamat.trim()) er.alamat = "Alamat toko wajib diisi.";
    setErrors(er);
    if (Object.keys(er).length) return;

    aksi.ubahAkun(pengguna.id, {
      namaToko: form.namaToko.trim(),
      telepon: form.telepon.trim(),
      alamat: form.alamat.trim(),
      deskripsi: form.deskripsi.trim(),
    });
    setPesan("Profil toko berhasil disimpan.");
  };

  const props = { form, errors, onChange: ubah };

  return (
    <form className="card isi-card" style={{ maxWidth: 560 }} onSubmit={simpan} noValidate>
      <h1 className="judul">Profil Toko</h1>
      <p className="mu">
        Informasi ini tampil di halaman toko Anda. Foto toko mengikuti foto profil
        yang diatur di <Link to="/penjual/akun">Profil Saya</Link>.{" "}
        <Link to={`/toko/${pengguna.id}`}>Lihat halaman toko</Link>
      </p>
      {pesan && <p className="alert alert-ok" role="status">{pesan}</p>}

      <Field label="Nama toko" name="namaToko" {...props} />
      <Field label="Nomor telepon / WhatsApp" name="telepon" type="tel" {...props} />
      <Field label="Alamat toko" name="alamat" area {...props} />
      <Field label="Deskripsi toko" name="deskripsi" area {...props} />

      <button type="submit" className="btn btn-primary">Simpan</button>
    </form>
  );
}