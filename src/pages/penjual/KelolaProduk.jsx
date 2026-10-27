import { useRef, useState } from "react";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";
import { olahFoto } from "../../utils/gambar";
import { rupiah } from "../../utils/format";

const MAKS_FOTO = 5;
const MAKS_UKURAN = 2 * 1024 * 1024; // 2 MB per foto asli

const baru = (kat) => ({
  nama: "", kategori: kat, kategoriToko: "", harga: "", stok: "",
  berat: "", kondisi: "Baru", deskripsi: "", foto: [],
});
const inisial = (nama) => nama.split(" ").slice(0, 2).map((k) => k[0]).join("");

export default function KelolaProduk() {
  const { db, pengguna, aksi } = useStore();
  const saya = db.produk.filter((p) => p.penjualId === pengguna.id);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const [errFoto, setErrFoto] = useState("");
  const inputFoto = useRef(null);

  const ubah = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pilihFoto = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    const sisa = MAKS_FOTO - form.foto.length;
    const pesan = [];
    const layak = [];
    for (const f of files) {
      if (!["image/jpeg", "image/png"].includes(f.type)) pesan.push(`${f.name}: format harus JPEG atau PNG.`);
      else if (f.size > MAKS_UKURAN) pesan.push(`${f.name}: ukuran maksimal 2 MB.`);
      else layak.push(f);
    }
    if (layak.length > sisa) pesan.push(`Maksimal ${MAKS_FOTO} foto. Foto berlebih diabaikan.`);
    try {
      const hasil = await Promise.all(layak.slice(0, sisa).map((f) => olahFoto(f)));
      setForm((x) => ({ ...x, foto: [...x.foto, ...hasil].slice(0, MAKS_FOTO) }));
    } catch {
      pesan.push("Ada foto yang tidak dapat dibaca. Coba file lain.");
    }
    setErrFoto(pesan.join(" "));
  };
  const hapusFoto = (i) => setForm((f) => ({ ...f, foto: f.foto.filter((_, x) => x !== i) }));
  const jadikanUtama = (i) =>
    setForm((f) => ({ ...f, foto: [f.foto[i], ...f.foto.filter((_, x) => x !== i)] }));

  const buka = (p) => {
    setForm(p ? { ...baru(p.kategori), ...p, foto: p.foto || [] } : baru(db.kategori[0]?.nama || ""));
    setErr("");
    setErrFoto("");
  };
  const tutup = () => { setForm(null); setErr(""); setErrFoto(""); };

  const simpan = (e) => {
    e.preventDefault();
    const harga = Number(form.harga), stok = Number(form.stok);
    const berat = form.berat === "" ? "" : Number(form.berat);
    if (!form.nama.trim() || !form.kategori) return setErr("Nama dan kategori wajib diisi.");
    if (!form.id && form.foto.length === 0) return setErr("Tambahkan minimal 1 foto produk.");
    if (!(harga > 0) || !Number.isInteger(stok) || stok < 0) return setErr("Harga harus lebih dari 0 dan stok bilangan bulat 0 atau lebih.");
    if (berat !== "" && !(berat > 0)) return setErr("Berat harus lebih dari 0 gram, atau kosongkan.");
    aksi.simpanProduk({ ...form, nama: form.nama.trim(), harga, stok, berat, penjualId: pengguna.id });
    tutup();
  };

  const rows = saya.map((p) => [
    <span className="thumb" key="f">
      {p.foto?.[0] ? <img src={p.foto[0]} alt="" /> : inisial(p.nama)}
    </span>,
    p.nama, p.kategori, p.kategoriToko || "-", rupiah(p.harga), p.stok,
    <span className="aksi-row" key="a">
      <button type="button" className="btn btn-sm" onClick={() => buka(p)}>Ubah</button>
      <button type="button" className="btn btn-sm" onClick={() => window.confirm("Hapus produk ini?") && aksi.hapusProduk(p.id)}>Hapus</button>
    </span>,
  ]);

  return (
    <>
      <div className="baris-atas">
        <h1 className="judul">Produk</h1>
        {!form && <button type="button" className="btn btn-primary" onClick={() => buka(null)}>+ Tambah produk</button>}
      </div>

      {form && (
        <form className="card isi-card" onSubmit={simpan} noValidate>
          <h2>{form.id ? "Ubah produk" : "Tambah produk baru"}</h2>
          {err && <p className="alert" role="alert">{err}</p>}

          <h3 className="form-section">Foto produk</h3>
          <div className="foto-grid">
            {form.foto.map((src, i) => (
              <div className="foto-item" key={i}>
                <img src={src} alt={`Foto produk ${i + 1}`} />
                {i === 0 && <span className="foto-utama">Foto utama</span>}
                <div className="foto-aksi">
                  {i > 0 && <button type="button" onClick={() => jadikanUtama(i)}>Jadikan utama</button>}
                  <button type="button" onClick={() => hapusFoto(i)}>Hapus</button>
                </div>
              </div>
            ))}
            {form.foto.length < MAKS_FOTO && (
              <button type="button" className="foto-tambah" onClick={() => inputFoto.current.click()}>
                + Tambah foto
                <small>{form.foto.length}/{MAKS_FOTO}</small>
              </button>
            )}
          </div>
          <input ref={inputFoto} type="file" accept="image/jpeg,image/png" multiple hidden onChange={pilihFoto} aria-label="Pilih foto produk" />
          {errFoto && <span className="field-error">{errFoto}</span>}
          <span className="field-hint">Maksimal {MAKS_FOTO} foto, JPEG atau PNG, 2 MB per foto. Foto pertama jadi foto utama.</span>

          <h3 className="form-section">Informasi produk</h3>
          <div className="field"><label htmlFor="nama">Nama produk</label><input id="nama" name="nama" value={form.nama} onChange={ubah} /></div>
          <div className="field"><label htmlFor="kategori">Kategori marketplace</label>
            <select id="kategori" name="kategori" value={form.kategori} onChange={ubah}>{db.kategori.map((k) => <option key={k.id}>{k.nama}</option>)}</select>
            <span className="field-hint">Wajib. Menentukan produk muncul di filter kategori Beranda.</span></div>
          {(pengguna.kategoriToko || []).length > 0 && (
            <div className="field"><label htmlFor="kategoriToko">Kategori toko (opsional)</label>
              <select id="kategoriToko" name="kategoriToko" value={form.kategoriToko || ""} onChange={ubah}>
                <option value="">Tanpa kategori toko</option>
                {pengguna.kategoriToko.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <span className="field-hint">Untuk mengelompokkan produk di etalase toko Anda.</span></div>
          )}
          <div className="field"><label htmlFor="deskripsi">Deskripsi produk</label><textarea id="deskripsi" name="deskripsi" value={form.deskripsi} onChange={ubah} /></div>

          <h3 className="form-section">Harga dan stok</h3>
          <div className="field"><label htmlFor="harga">Harga (Rp)</label><input id="harga" name="harga" type="number" min="1" value={form.harga} onChange={ubah} /></div>
          <div className="field"><label htmlFor="stok">Stok</label><input id="stok" name="stok" type="number" min="0" value={form.stok} onChange={ubah} /></div>

          <h3 className="form-section">Pengiriman dan kondisi</h3>
          <div className="field"><label htmlFor="berat">Berat (gram, opsional)</label><input id="berat" name="berat" type="number" min="1" value={form.berat} onChange={ubah} /></div>
      
          <div className="aksi-row">
            <button type="submit" className="btn btn-primary">Simpan</button>
            <button type="button" className="btn btn-ghost" onClick={tutup}>Batal</button>
          </div>
        </form>
      )}

      <Tabel heads={["Foto", "Produk", "Kategori", "Kategori Toko", "Harga", "Stok", "Aksi"]} rows={rows} kosong="Belum ada produk." />
    </>
  );
}