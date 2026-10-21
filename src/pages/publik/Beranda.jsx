import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/produk/ProductCard";
import { useStore } from "../../context/Store";

export default function Beranda() {
  const { db, pengguna, keranjang, aksi } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const kata = (params.get("q") ?? "").trim().toLowerCase();
  const kat = params.get("kat") ?? "Semua";

  const penjualAktif = (id) => db.akun.find((a) => a.id === id && a.status === "aktif");
  const hasil = db.produk.filter(
    (p) =>
      penjualAktif(p.penjualId) &&
      (kat === "Semua" || p.kategori === kat) &&
      p.nama.toLowerCase().includes(kata),
  );
  const tambah = (p) => (pengguna ? aksi.tambahKeranjang(p) : navigate("/masuk"));
  const jumlah = (id) => keranjang.find((k) => k.produkId === id)?.jumlah ?? 0;

  return (
    <section className="container section">
      <p className="hasil-info">{hasil.length} produk ditemukan</p>
      {hasil.length > 0 ? (
        <div className="grid">
          {hasil.map((p) => (
            <ProductCard
              key={p.id}
              produk={p}
              toko={penjualAktif(p.penjualId).namaToko}
              jumlahDiKeranjang={jumlah(p.id)}
              onTambah={tambah}
              nonaktif={!!pengguna && pengguna.peran !== "pembeli"}
            />
          ))}
        </div>
      ) : (
        <div className="kosong"><p>Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.</p></div>
      )}
    </section>
  );
}