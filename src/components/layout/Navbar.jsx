import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/Store";

const menuUser = {
  pembeli: [{ to: "/akun", label: "Akun Saya" }, { to: "/pesanan", label: "Pesanan Saya" }],
  penjual: [
    { to: "/penjual", label: "Toko Saya" },
    { to: "/penjual/pesanan", label: "Pesanan Masuk" },
    { to: "/penjual/akun", label: "Profil Saya" },
  ],
  pemilik: [{ to: "/pemilik", label: "Dashboard" }, { to: "/pemilik/akun", label: "Profil Saya" }],
};

export default function Navbar() {
  const { db, pengguna, keranjang, aksi } = useStore();
  const navigate = useNavigate();
  const [terbuka, setTerbuka] = useState(false);
  const kotak = useRef(null);

  // tutup panel saat klik di luar atau menekan Escape
  useEffect(() => {
    if (!terbuka) return;
    const klikLuar = (e) => {
      if (kotak.current && !kotak.current.contains(e.target)) setTerbuka(false);
    };
    const tekanEsc = (e) => {
      if (e.key === "Escape") setTerbuka(false);
    };
    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", tekanEsc);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", tekanEsc);
    };
  }, [terbuka]);

  const keluar = () => {
    setTerbuka(false);
    navigate("/");
    aksi.keluar();
  };

  const totalItem = keranjang.reduce((t, i) => t + i.jumlah, 0);
  const belumBaca = pengguna
    ? db.notif.filter((n) => n.userId === pengguna.id && !n.dibaca).length
    : 0;
  const pembeli = pengguna?.peran === "pembeli";
  const username = pengguna ? (pengguna.username ?? pengguna.email.split("@")[0]) : "";

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* KIRI: logo + pendaftaran penjual (seperti Seller Centre di Shopee) */}
        <div className="navbar-kiri">
          <Link className="logo" to="/">LOKALO</Link>
          {!pengguna && (
            <Link className="link-penjual" to="/daftar/penjual">Daftar Penjual</Link>
          )}
        </div>

        {/* KANAN: pembeli */}
        <nav className="navbar-actions" aria-label="Menu utama">
          {pembeli && (
            <Link className="btn btn-ghost" to="/notifikasi">
              Notifikasi {belumBaca > 0 && <span className="badge">{belumBaca}</span>}
            </Link>
          )}

          {pengguna ? (
            <div className="menu-user" ref={kotak}>
              <button
                type="button"
                className="menu-user-btn"
                aria-haspopup="menu"
                aria-expanded={terbuka}
                onClick={() => setTerbuka((t) => !t)}
              >
                <span className="avatar-kecil">
                  {pengguna.foto ? <img src={pengguna.foto} alt="" /> : username[0].toUpperCase()}
                </span>
                <span className="menu-user-nama">{username}</span>
              </button>

              {terbuka && (
                <div className="menu-user-panel" role="menu">
                  {menuUser[pengguna.peran].map((m) => (
                    <Link key={m.to} to={m.to} role="menuitem" onClick={() => setTerbuka(false)}>
                      {m.label}
                    </Link>
                  ))}
                  <button type="button" role="menuitem" onClick={keluar}>Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/masuk">Masuk</Link>
              <Link className="btn btn-outline" to="/daftar/pembeli">Daftar</Link>
            </>
          )}

          {(!pengguna || pembeli) && (
            <Link className="cart-ikon" to="/keranjang" aria-label={`Keranjang, ${totalItem} item`} title="Keranjang">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalItem > 0 && <span className="cart-badge">{totalItem}</span>}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}