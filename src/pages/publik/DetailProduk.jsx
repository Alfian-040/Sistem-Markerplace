import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";

export default function DetailProduk() {
  const { id } = useParams();
  const { db, pengguna, keranjang, aksi } = useStore();
  const navigate = useNavigate();
  const [jumlah, setJumlah] = useState(1);
  const [aktif, setAktif] = useState(0);
  const p = db.produk.find((x) => x.id === Number(id));
  if (!p) return <section className="container section"><p>Produk tidak ditemukan. <Link to="/">Kembali ke Beranda</Link></p></section>;

  const toko = db.akun.find((a) => a.id === p.penjualId);
  const fotos = p.foto || [];
  const foto = fotos[aktif] || fotos[0];
  const di = keranjang.find((k) => k.produkId === p.id)?.jumlah ?? 0;
  const qty = Math.min(Math.max(jumlah, 1), Math.max(p.stok, 1));
  const habis = p.stok === 0;
  const keranjangPenuh = di >= p.stok;
  const bukanPembeli = !!pengguna && pengguna.peran !== "pembeli";

  const masukKeranjang = () => (pengguna ? aksi.tambahKeranjang(p, qty) : navigate("/masuk"));
  const beliSekarang = () =>
    pengguna ? navigate(`/checkout?beli=${p.id}&jumlah=${qty}`) : navigate("/masuk");

  return (
    <section className="container section">
      <Link to="/">← Kembali</Link>
      <div className="detail">
        <div className="detail-galeri">
          {foto ? (
            <img className="detail-foto" src={foto} alt={p.nama} />
          ) : (
            <div className={`detail-tile tile-${p.kategori.toLowerCase()}`} aria-hidden="true">{p.nama.split(" ").slice(0, 2).map((k) => k[0]).join("")}</div>
          )}
          {fotos.length > 1 && (
            <div className="detail-thumbs">
              {fotos.map((src, i) => (
                <button key={i} type="button" className={i === aktif ? "on" : ""} onClick={() => setAktif(i)} aria-label={`Lihat foto ${i + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="card-kategori">{p.kategori}</span>
          <h1>{p.nama}</h1>
          <p className="card-harga" style={{ fontSize: "1.5rem" }}>{rupiah(p.harga)}</p>
          <p className="mu" style={{ marginTop: 6 }}>
            Kondisi: {p.kondisi || "Baru"}{p.berat ? ` · Berat: ${p.berat} g` : ""}
          </p>
          <p style={{ margin: "12px 0" }}>{p.deskripsi}</p>
          <p className="card-stok">{habis ? "Stok habis" : `Stok ${p.stok}`}</p>

          <div className="card" style={{ margin: "16px 0", padding: 16, gap: 4 }}>
            <strong>{toko?.namaToko}</strong>
            <p className="card-toko">{toko?.alamat}</p>
            <p className="card-toko">{toko?.deskripsi}</p>
            {p.kategoriToko && (
              <p className="card-toko">
                Etalase: <Link to={`/toko/${p.penjualId}?kat=${encodeURIComponent(p.kategoriToko)}`}>{p.kategoriToko}</Link>
              </p>
            )}
            <Link className="btn btn-outline btn-sm" style={{ marginTop: 8, alignSelf: "flex-start" }} to={`/toko/${p.penjualId}`}>
              Kunjungi Toko
            </Link>
          </div>

          {!habis && !bukanPembeli && (
            <div className="field">
              <label id="lbl-jumlah">Jumlah</label>
              <span className="qty" role="group" aria-labelledby="lbl-jumlah">
                <button type="button" className="btn btn-sm" disabled={qty <= 1} onClick={() => setJumlah(qty - 1)} aria-label="Kurangi jumlah">−</button>
                <strong>{qty}</strong>
                <button type="button" className="btn btn-sm" disabled={qty >= p.stok} onClick={() => setJumlah(qty + 1)} aria-label="Tambah jumlah">+</button>
              </span>
              {di > 0 && <span className="field-hint">Sudah {di} di keranjang Anda.</span>}
            </div>
          )}

          <div className="aksi-row">
            <button type="button" className="btn btn-outline" disabled={habis || keranjangPenuh || bukanPembeli} onClick={masukKeranjang}>
              {habis ? "Stok habis" : keranjangPenuh ? "Maksimal di keranjang" : "Masukkan Keranjang"}
            </button>
            <button type="button" className="btn btn-primary" disabled={habis || bukanPembeli} onClick={beliSekarang}>
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}