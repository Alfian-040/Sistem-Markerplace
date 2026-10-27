import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";

export default function Checkout() {
  const { db, pengguna, keranjang, aksi } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const alamat = db.alamat.filter((a) => a.pembeliId === pengguna.id);
  const [pilih, setPilih] = useState(alamat[0]?.id ?? null);
  const [pesan, setPesan] = useState("");

  // Beli Sekarang: /checkout?beli=<idProduk>&jumlah=<n>
  const beliId = Number(params.get("beli")) || null;
  const produkLangsung = beliId ? db.produk.find((p) => p.id === beliId) : null;
  const jumlahLangsung = produkLangsung
    ? Math.min(Math.max(Number(params.get("jumlah")) || 1, 1), produkLangsung.stok)
    : 0;
  const items = beliId
    ? produkLangsung && jumlahLangsung > 0
      ? [{ produk: produkLangsung, jumlah: jumlahLangsung }]
      : []
    : keranjang;
  const total = items.reduce((t, i) => t + i.produk.harga * i.jumlah, 0);

  if (items.length === 0) {
    return (
      <section className="container section">
        <p className="kosong">
          {beliId ? "Produk tidak tersedia atau stok habis." : "Keranjang kosong."} <Link to="/">Belanja dulu</Link>
        </p>
      </section>
    );
  }

  const buat = () => {
    const r = aksi.buatPesanan(pilih, beliId ? { produkId: beliId, jumlah: jumlahLangsung } : undefined);
    if (r.pesan) return setPesan(r.pesan);
    navigate(`/pembayaran/${r.ids.join(",")}`);
  };

  return (
    <section className="container section">
      <h1 className="judul">Konfirmasi Pesanan</h1>
      
      {pesan && <p className="alert" role="alert">{pesan}</p>}
      <Tabel heads={["Produk", "Jumlah", "Subtotal"]} rows={items.map((i) => [i.produk.nama, i.jumlah, rupiah(i.produk.harga * i.jumlah)])} />
      <h2 className="sub">Alamat pengiriman</h2>
      {alamat.length === 0 ? <p className="kosong">Belum ada alamat. <Link to="/akun/alamat">Tambah alamat</Link></p> : alamat.map((a) => (
        <label key={a.id} className="card isi-card pilih-alamat">
          <input type="radio" name="alamat" checked={pilih === a.id} onChange={() => setPilih(a.id)} />
          <span><strong>{a.penerima}</strong> · {a.telepon}<br />{a.alamat}</span>
        </label>
      ))}
      
      <div className="total-bar">
        <strong>Total: {rupiah(total)}</strong>
        <button type="button" className="btn btn-primary" onClick={buat}>Buat Pesanan</button>
      </div>
    </section>
  );
}