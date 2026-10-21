import { useState } from "react";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";

export default function KelolaKategori() {
  const { db, aksi } = useStore();
  const [f, setF] = useState({ nama: "" });
  const [err, setErr] = useState("");
  const simpan = (e) => {
    e.preventDefault();
    const nama = f.nama.trim();
    if (!nama) return setErr("Nama kategori wajib diisi.");
    if (db.kategori.some((k) => k.nama.toLowerCase() === nama.toLowerCase() && k.id !== f.id)) return setErr("Kategori sudah ada.");
    aksi.simpanKategori({ ...f, nama });
    setF({ nama: "" }); setErr("");
  };
  const hapus = (id) => { if (window.confirm("Hapus kategori ini?")) setErr(aksi.hapusKategori(id)); };
  const rows = db.kategori.map((k) => [k.nama, db.produk.filter((p) => p.kategori === k.nama).length,
    <span className="aksi-row" key="a">
      <button type="button" className="btn btn-sm" onClick={() => setF(k)}>Ubah</button>
      <button type="button" className="btn btn-sm" onClick={() => hapus(k.id)}>Hapus</button>
    </span>]);
  return (
    <>
      <h1 className="judul">Kelola Kategori</h1>
      <form className="card isi-card baris-form" onSubmit={simpan}>
        {err && <p className="alert" role="alert" style={{ flexBasis: "100%" }}>{err}</p>}
        <input placeholder="Nama kategori" value={f.nama} onChange={(e) => setF((x) => ({ ...x, nama: e.target.value }))} />
        <button type="submit" className="btn btn-primary btn-sm">{f.id ? "Simpan" : "Tambah"}</button>
        {f.id && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF({ nama: "" })}>Batal</button>}
      </form>
      <Tabel heads={["Kategori", "Jumlah produk", "Aksi"]} rows={rows} />
    </>
  );
}
