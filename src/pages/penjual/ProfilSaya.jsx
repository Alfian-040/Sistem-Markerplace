import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Field from "../../components/common/Field";
import { useStore } from "../../context/Store";

const REGEX_USERNAME = /^[a-zA-Z0-9._]{3,20}$/;
const hariIni = new Date().toISOString().slice(0, 10);
const MAKS_FOTO_KB = 500; // ubah angka ini untuk mengganti batas ukuran foto

// Potong persegi dari tengah, kecilkan ke 256px, simpan sebagai JPEG ringan
const olahFoto = (file) =>
  new Promise((ok, gagal) => {
    const baca = new FileReader();
    baca.onerror = gagal;
    baca.onload = () => {
      const img = new Image();
      img.onerror = gagal;
      img.onload = () => {
        const sisi = Math.min(img.width, img.height);
        const kanvas = document.createElement("canvas");
        kanvas.width = kanvas.height = 256;
        kanvas.getContext("2d").drawImage(img, (img.width - sisi) / 2, (img.height - sisi) / 2, sisi, sisi, 0, 0, 256, 256);
        ok(kanvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = baca.result;
    };
    baca.readAsDataURL(file);
  });

// Profil Saya khusus penjual (data pribadi pemilik toko).
// Nomor telepon dan alamat usaha diatur di Profil Toko.
export default function ProfilSaya() {
  const { pengguna, aksi } = useStore();
  const [form, setForm] = useState({
    username: pengguna.username || "",
    nama: pengguna.nama || "",
    gender: pengguna.gender || "",
    tglLahir: pengguna.tglLahir || "",
    foto: pengguna.foto || "",
  });
  const [errors, setErrors] = useState({});
  const [pesan, setPesan] = useState("");
  const inputFoto = useRef(null);

  const ubah = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((x) => ({ ...x, [name]: undefined }));
    setPesan("");
  };

  const pilihFoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) return setErrors((x) => ({ ...x, foto: "Format foto harus JPEG atau PNG." }));
    if (file.size > MAKS_FOTO_KB * 1024) return setErrors((x) => ({ ...x, foto: `Ukuran foto maksimal ${MAKS_FOTO_KB} KB.` }));
    try {
      const foto = await olahFoto(file);
      setForm((f) => ({ ...f, foto }));
      setErrors((x) => ({ ...x, foto: undefined }));
      setPesan("");
    } catch {
      setErrors((x) => ({ ...x, foto: "Foto tidak dapat dibaca. Coba file lain." }));
    }
  };

  const simpan = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.nama.trim()) er.nama = "Nama wajib diisi.";
    if (form.username.trim() && !REGEX_USERNAME.test(form.username.trim()))
      er.username = "Username 3–20 karakter: huruf, angka, titik, atau garis bawah.";
    if (form.tglLahir && form.tglLahir > hariIni) er.tglLahir = "Tanggal lahir tidak boleh di masa depan.";
    setErrors(er);
    if (Object.keys(er).length) return;

    const r = aksi.ubahProfil({
      username: form.username.trim(),
      nama: form.nama.trim(),
      gender: form.gender,
      tglLahir: form.tglLahir,
      foto: form.foto,
    });
    if (r.pesan) return setErrors({ username: r.pesan });
    setPesan("Profil berhasil disimpan.");
  };

  const props = { form, errors, onChange: ubah };

  return (
    <form className="card isi-card" onSubmit={simpan} noValidate>
      <h1 className="judul">Profil Saya</h1>
      <p className="mu">Kelola informasi profil Anda untuk mengontrol dan mengamankan akun.</p>
      {pesan && <p className="alert alert-ok" role="status">{pesan}</p>}

      <div className="profil-grid">
        <div>
          <Field label="Username" name="username" hint="Tampil di menu akun. Boleh dikosongkan." {...props} />
          <Field label="Nama" name="nama" {...props} />
          <Field label="Email" name="email" type="email" disabled hint="Email tidak dapat diubah."
            form={{ ...form, email: pengguna.email }} errors={errors} onChange={() => {}} />
          <p className="mu">
            Nomor telepon dan alamat usaha diatur di <Link to="/penjual/toko">Profil Toko</Link>.
          </p>

          <div className="field">
            <label id="lbl-gender">Jenis kelamin</label>
            <div className="radio-row" role="radiogroup" aria-labelledby="lbl-gender">
              {[["L", "Laki-laki"], ["P", "Perempuan"]].map(([v, l]) => (
                <label key={v}>
                  <input type="radio" name="gender" value={v} checked={form.gender === v} onChange={ubah} /> {l}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="tglLahir">Tanggal lahir</label>
            <input id="tglLahir" name="tglLahir" type="date" max={hariIni} value={form.tglLahir} onChange={ubah}
              aria-invalid={errors.tglLahir ? "true" : "false"} />
            {errors.tglLahir && <span className="field-error">{errors.tglLahir}</span>}
          </div>

          <button type="submit" className="btn btn-primary">Simpan</button>
        </div>

        <div className="profil-foto">
          <Avatar foto={form.foto} size={110} nama={pengguna.namaToko} />
          <input ref={inputFoto} type="file" accept="image/jpeg,image/png" hidden onChange={pilihFoto} aria-label="Pilih foto profil" />
          <button type="button" className="btn btn-outline btn-sm" onClick={() => inputFoto.current.click()}>Pilih Foto</button>
          {form.foto && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setForm((f) => ({ ...f, foto: "" })); setPesan(""); }}>Hapus Foto</button>
          )}
          {errors.foto && <span className="field-error">{errors.foto}</span>}
          <span className="field-hint">Ukuran maksimal {MAKS_FOTO_KB} KB.<br />Format: JPEG atau PNG.<br />Foto ini juga tampil sebagai foto toko.</span>
        </div>
      </div>
    </form>
  );
}