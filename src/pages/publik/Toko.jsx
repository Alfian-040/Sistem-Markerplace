import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import ProductCard from "../../components/produk/ProductCard";
import { useStore } from "../../context/Store";

const LAINNYA = "__lainnya";

export default function Toko() {
  const { id } = useParams();
  const { db, pengguna, keranjang, aksi } = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const kat = params.get("kat") ?? "";
  const urut = params.get("urut") ?? "baru";

  const toko = db.akun.find((a) => a.id === Number(id) && a.peran === "penjual" && a.status === "aktif");
  if (!toko) {
    return (
      <section className="container section">
        <p>Toko tidak ditemukan. <Link to="/">Kembali ke Beranda</Link></p>
      </section>
    );
  }

  const setParam = (k, v) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };

  const semua = db.produk.filter((p) => p.penjualId === toko.id);
  const daftarKat = toko.kategoriToko || [];
  const tanpaKat = semua.filter((p) => !p.kategoriToko || !daftarKat.includes(p.kategoriToko));
  const jumlahKat = (k) => semua.filter((p) => p.kategoriToko === k).length;
  const pesananSelesai = db.pesanan.filter((o) => o.penjualId === toko.id && o.status === "selesai").length;

  const kata = q.trim().toLowerCase();
  const hasil = semua
    .filter((p) => {
      if (kat === LAINNYA) return !p.kategoriToko || !daftarKat.includes(p.kategoriToko);
      return !kat || p.kategoriToko === kat;
    })
    .filter((p) => p.nama.toLowerCase().includes(kata))
    .sort((a, b) => {
      if (urut === "termurah") return a.harga - b.harga;
      if (urut === "termahal") return b.harga - a.harga;
      return b.id - a.id; // terbaru: id dibuat dari waktu, makin besar makin baru
    });

  const tambah = (p) => (pengguna ? aksi.tambahKeranjang(p) : navigate("/masuk"));
  const jumlah = (pid) => keranjang.find((k) => k.produkId === pid)?.jumlah ?? 0;
  const judulKat = kat === LAINNYA ? "Lainnya" : kat || "Semua Produk";

  return (
    <section className="container section">
      <Link to="/">← Kembali</Link>

      <div className="card toko-header">
        <Avatar foto={toko.foto} size={84} nama={toko.namaToko} />
        <div className="toko-info">
          <h1>{toko.namaToko}</h1>
          {toko.deskripsi && <p>{toko.deskripsi}</p>}
          {toko.alamat && <p className="mu">{toko.alamat}</p>}
          <div className="toko-stat">
            <span><strong>{semua.length}</strong> Produk</span>
            <span><strong>{pesananSelesai}</strong> Pesanan selesai</span>
          </div>
        </div>
      </div>

      <div className="toko-layout">
        <aside className="toko-side" aria-label="Kategori toko">
          <p className="toko-side-judul">Kategori</p>
          <button type="button" className={!kat ? "on" : ""} onClick={() => setParam("kat", "")}>
            Semua Produk <span>{semua.length}</span>
          </button>
          {daftarKat.map((k) => (
            <button key={k} type="button" className={kat === k ? "on" : ""} onClick={() => setParam("kat", k)}>
              {k} <span>{jumlahKat(k)}</span>
            </button>
          ))}
          {daftarKat.length > 0 && tanpaKat.length > 0 && (
            <button type="button" className={kat === LAINNYA ? "on" : ""} onClick={() => setParam("kat", LAINNYA)}>
              Lainnya <span>{tanpaKat.length}</span>
            </button>
          )}
        </aside>

        <div className="toko-main">
          <div className="toko-bar">
            <input
              type="search"
              className="search"
              placeholder={`Cari di ${toko.namaToko}`}
              aria-label="Cari produk di toko ini"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
            />
            <select aria-label="Urutkan produk" value={urut} onChange={(e) => setParam("urut", e.target.value === "baru" ? "" : e.target.value)}>
              <option value="baru">Terbaru</option>
              <option value="termurah">Harga: terendah</option>
              <option value="termahal">Harga: tertinggi</option>
            </select>
          </div>

          <p className="hasil-info">{judulKat} · {hasil.length} produk</p>

          {hasil.length > 0 ? (
            <div className="grid">
              {hasil.map((p) => (
                <ProductCard
                  key={p.id}
                  produk={p}
                  toko={toko.namaToko}
                  linkToko={false}
                  jumlahDiKeranjang={jumlah(p.id)}
                  onTambah={tambah}
                  nonaktif={!!pengguna && pengguna.peran !== "pembeli"}
                />
              ))}
            </div>
          ) : (
            <div className="kosong"><p>Tidak ada produk yang cocok di toko ini.</p></div>
          )}
        </div>
      </div>
    </section>
  );
}