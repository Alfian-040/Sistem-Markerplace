import { useState } from "react";
import { useStore } from "../../context/Store";
import Field from "../../components/common/Field";

const kosong = { lama: "", baru: "", konfirmasi: "" };

export default function UbahPassword() {
  const { aksi } = useStore();
  const [form, setForm] = useState(kosong);
  const [errors, setErrors] = useState({});
  const [pesan, setPesan] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setPesan("");
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.lama) e.lama = "Password saat ini wajib diisi.";
    if (form.baru.length < 8) e.baru = "Password baru minimal 8 karakter.";
    else if (form.baru === form.lama) e.baru = "Password baru tidak boleh sama dengan password lama.";
    if (form.konfirmasi !== form.baru) e.konfirmasi = "Konfirmasi password tidak sama.";
    if (Object.keys(e).length) return setErrors(e);

    const hasil = aksi.ubahPassword(form.lama, form.baru);
    if (hasil.pesan) return setErrors({ lama: hasil.pesan });
    setForm(kosong);
    setErrors({});
    setPesan("Password berhasil diubah.");
  };

  const props = { form, errors, onChange };
  return (
    <div>
      <h1 className="judul">Ubah Password</h1>
      {pesan && <p className="sukses-box" role="status">{pesan}</p>}
      <form className="card isi-card form-sempit" onSubmit={submit} noValidate>
        <Field label="Password saat ini" name="lama" type="password" {...props} />
        <Field label="Password baru" name="baru" type="password" hint="Minimal 8 karakter." {...props} />
        <Field label="Konfirmasi password baru" name="konfirmasi" type="password" {...props} />
        <button type="submit" className="btn btn-primary">Simpan</button>
      </form>
    </div>
  );
}