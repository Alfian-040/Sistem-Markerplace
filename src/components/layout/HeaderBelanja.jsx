import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../context/Store";

// true = judul besar ikut tampil di semua halaman, false = hanya di Beranda
const JUDUL_SELALU = false;

export default function HeaderBelanja() {
  const { db } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const katParam = params.get("kat") ?? "Semua";
  const [kata, setKata] = useState(q);
  useEffect(() => setKata(q), [q]);

  // Catat tinggi Navbar ke variabel CSS --navbar-h, supaya kotak belanja
  // menempel pas di bawahnya (tinggi Navbar berubah di layar HP).
  useEffect(() => {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    const pasang = () => document.documentElement.style.setProperty("--navbar-h", `${nav.offsetHeight}px`);
    pasang();
    const pantau = new ResizeObserver(pasang);
    pantau.observe(nav);
    return () => pantau.disconnect();
  }, []);

  // halaman penjual dan pemilik tidak memakai kotak belanja
  if (pathname.startsWith("/penjual") || pathname.startsWith("/pemilik")) return null;

  const diBeranda = pathname === "/";
  const aktif = diBeranda ? katParam : null;
  const alamat = (kataBaru, kategori) => {
    const p = new URLSearchParams();
    if (kataBaru.trim()) p.set("q", kataBaru.trim());
    if (kategori && kategori !== "Semua") p.set("kat", kategori);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const ubah = (e) => {
    setKata(e.target.value);
    if (diBeranda) navigate(alamat(e.target.value, katParam), { replace: true });
  };
  const cari = (e) => {
    e.preventDefault();
    navigate(alamat(kata, katParam));
  };

  return (
    // hero-sticky: seluruh blok (judul, kolom cari, kategori) menempel di bawah Navbar
    <section className={diBeranda ? "hero hero-sticky" : "hero hero-kecil hero-sticky"}>
      <div className="container">
        {(diBeranda || JUDUL_SELALU) && (
          <>
            <h1>Belanja langsung dari UMKM lokal</h1>
            <p>Temukan makanan, fashion, kerajinan, dan produk lain dari penjual di sekitar Anda.</p>
          </>
        )}
        <form className="cari-form" onSubmit={cari} role="search">
          <input
            type="search"
            className="search"
            placeholder="Cari produk, misalnya kopi atau batik"
            aria-label="Cari produk"
            value={kata}
            onChange={ubah}
          />
          <button type="submit" className="btn btn-cari">Cari</button>
        </form>
        <div className="chips chips-hero" role="group" aria-label="Filter kategori">
          {["Semua", ...db.kategori.map((k) => k.nama)].map((n) => (
            <button
              key={n}
              type="button"
              className={n === aktif ? "chip active" : "chip"}
              onClick={() => navigate(alamat(kata, n))}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}