import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/Store";

const tujuan = { pemilik: "/pemilik", penjual: "/penjual", pembeli: "/" };

export default function Masuk() {
  const { aksi } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [pesan, setPesan] = useState("");

  const ubah = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPesan("");
  };
  const kirim = (e) => {
    e.preventDefault();
    const r = aksi.masuk(form.email, form.password);
    if (r.pesan) return setPesan(r.pesan);
    navigate(tujuan[r.akun.peran]);
  };

  return (
    <section className="form-page">
      <form className="form-card" onSubmit={kirim} noValidate>
        <h1>Masuk</h1>
        <p className="form-intro"></p>
        {pesan && <p className="alert" role="alert">{pesan}</p>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={ubah} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={ubah} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-block">Masuk</button>
          <p className="form-note">Belum punya akun? <Link to="/daftar">Daftar</Link></p>
        </div>
        <div className="demo">
          <strong></strong>
          <ul>
            
          </ul>
        </div>
      </form>
    </section>
  );
}
