import { useState } from "react";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";

export default function KelolaKategoriToko() {
  const { db, pengguna, aksi } = useStore();
  const daftar = pengguna.kategoriToko || [];
  const [nama, setNama] = useState("");
  const [lama, setLama] = useState(null); // nama yang sedang diubah
  const [err, setErr] = useState("");

  const simpan = (e) => {
    e.preventDefault();
    const r = aksi.simpanKategoriToko(nama, lama);
    if (r.pesan) return setErr(r.pesan);
    setNama("");
    setLama(null);
    setErr("");
  };

  const hapus = (k) => {
    if (window.confirm(`Hapus kategori toko "${k}"? Produknya tidak ikut terhapus.`)) {
      aksi.hapusKategoriToko(k);
      if (lama === k) { setLama(null); setNama(""); }
    }
  };

  const jumlah = (k) =>
    db.produk.filter((p) => p.penjualId === pengguna.id && p.kategoriToko === k).length;

  const rows = daftar.map((k) => [
    k,
    jumlah(k),
    <span className="aksi-row" key="a">
      <button type="button" className="btn btn-sm" onClick={() => { setLama(k); setNama(k); setErr(""); }}>Ubah</button>
      <button type="button" className="btn btn-sm" onClick={() => hapus(k)}>Hapus</button>
    </span>,
  ]);

  return (
    <>
      <h1 className="judul">Kategori Toko</h1>
      <p className="mu">
        
      </p>
      <form className="card isi-card baris-form" onSubmit={simpan}>
        {err && <p className="alert" role="alert" style={{ flexBasis: "100%" }}>{err}</p>}
        <input
          placeholder="Nama kategori toko"
          aria-label="Nama kategori toko"
          value={nama}
          onChange={(e) => { setNama(e.target.value); setErr(""); }}
        />
        <button type="submit" className="btn btn-primary btn-sm">{lama ? "Simpan" : "Tambah"}</button>
        {lama && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setLama(null); setNama(""); setErr(""); }}>
            Batal
          </button>
        )}
      </form>
      <Tabel heads={["Kategori toko", "Jumlah produk", "Aksi"]} rows={rows} kosong="Belum ada kategori toko." />
    </>
  );
}