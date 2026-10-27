import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useStore } from "../context/Store";
import LayoutDashboard from "../components/layout/LayoutDashboard";
import Beranda from "../pages/publik/Beranda";
import DetailProduk from "../pages/publik/DetailProduk";
import Toko from "../pages/publik/Toko";
import Masuk from "../pages/publik/Masuk";
import DaftarPembeli from "../pages/publik/DaftarPembeli";
import DaftarPenjual from "../pages/publik/DaftarPenjual";
import Keranjang from "../pages/pembeli/Keranjang";
import Alamat from "../pages/pembeli/Alamat";
import Checkout from "../pages/pembeli/Checkout";
import Pembayaran from "../pages/pembeli/Pembayaran";
import PesananSaya from "../pages/pembeli/PesananSaya";
import Notifikasi from "../pages/pembeli/Notifikasi";
import ProfilSaya from "../pages/pembeli/ProfilSaya";
import UbahPassword from "../pages/pembeli/UbahPassword";
import DashboardPenjual from "../pages/penjual/DashboardPenjual";
import ProfilToko from "../pages/penjual/ProfilToko";
import ProfilSayaPenjual from "../pages/penjual/ProfilSaya";
import KelolaProduk from "../pages/penjual/KelolaProduk";
import KelolaKategoriToko from "../pages/penjual/KelolaKategoriToko";
import KelolaPesanan from "../pages/penjual/KelolaPesanan";
import RiwayatTransaksi from "../pages/penjual/RiwayatTransaksi";
import DashboardPemilik from "../pages/pemilik/DashboardPemilik";
import VerifikasiPenjual from "../pages/pemilik/VerifikasiPenjual";
import KelolaPengguna from "../pages/pemilik/KelolaPengguna";
import KelolaKategori from "../pages/pemilik/KelolaKategori";
import MonitoringTransaksi from "../pages/pemilik/MonitoringTransaksi";

// Penjaga halaman per role (NFR01)
function Guard({ peran, children }) {
  const { pengguna, baruKeluar } = useStore();
  if (pengguna?.peran === peran) return children;
  // habis keluar: ke Beranda; belum pernah masuk: ke halaman Masuk
  return <Navigate to={baruKeluar ? "/" : "/masuk"} replace />;
}

const menuAkun = [
  { to: "/akun", label: "Profil Saya", end: true },
  { to: "/akun/alamat", label: "Alamat" },
  { to: "/akun/password", label: "Ubah Password" },
];
const menuPenjual = [
  { to: "/penjual", label: "Beranda", end: true },
  { to: "/penjual/produk", label: "Produk" },
  { to: "/penjual/kategori-toko", label: "Kategori Toko" },
  { to: "/penjual/pesanan", label: "Pesanan" },
  { to: "/penjual/riwayat", label: "Riwayat Transaksi" },
  { to: "/penjual/toko", label: "Profil Toko" },
  { to: "/penjual/akun", label: "Profil Saya" },
  { to: "/penjual/password", label: "Ubah Password" },
];
const menuPemilik = [
  { to: "/pemilik", label: "Dashboard", end: true },
  { to: "/pemilik/verifikasi", label: "Verifikasi Penjual" },
  { to: "/pemilik/pengguna", label: "Kelola Pengguna" },
  { to: "/pemilik/kategori", label: "Kelola Kategori" },
  { to: "/pemilik/transaksi", label: "Monitoring Transaksi" },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Beranda />} />
      <Route path="/produk/:id" element={<DetailProduk />} />
      <Route path="/toko/:id" element={<Toko />} />
      <Route path="/masuk" element={<Masuk />} />

      {/* Pendaftaran dipisah: pembeli (tombol Daftar, kanan) dan penjual (tautan di kiri Navbar) */}
      <Route path="/daftar" element={<Navigate to="/daftar/pembeli" replace />} />
      <Route path="/daftar/pembeli" element={<DaftarPembeli />} />
      <Route path="/daftar/penjual" element={<DaftarPenjual />} />

      <Route element={<Guard peran="pembeli"><Outlet /></Guard>}>
        <Route path="/keranjang" element={<Keranjang />} />
        {/* /alamat lama dialihkan ke menu Akun Saya, supaya tautan di Checkout tidak putus */}
        <Route path="/alamat" element={<Navigate to="/akun/alamat" replace />} />
        <Route path="/akun" element={<LayoutDashboard judul="Akun Saya" menu={menuAkun} />}>
          <Route index element={<ProfilSaya />} />
          <Route path="alamat" element={<Alamat />} />
          <Route path="password" element={<UbahPassword />} />
        </Route>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pembayaran/:ids" element={<Pembayaran />} />
        <Route path="/pesanan" element={<PesananSaya />} />
        <Route path="/riwayat" element={<PesananSaya riwayat />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
      </Route>

      <Route path="/penjual" element={<Guard peran="penjual"><LayoutDashboard judul="Toko Saya" menu={menuPenjual} /></Guard>}>
        <Route index element={<DashboardPenjual />} />
        <Route path="toko" element={<ProfilToko />} />
        <Route path="produk" element={<KelolaProduk />} />
        <Route path="kategori-toko" element={<KelolaKategoriToko />} />
        <Route path="pesanan" element={<KelolaPesanan />} />
        <Route path="riwayat" element={<RiwayatTransaksi />} />
        <Route path="akun" element={<ProfilSayaPenjual />} />
        <Route path="password" element={<UbahPassword />} />
      </Route>

      <Route path="/pemilik" element={<Guard peran="pemilik"><LayoutDashboard judul="Pemilik Marketplace" menu={menuPemilik} /></Guard>}>
        <Route index element={<DashboardPemilik />} />
        <Route path="verifikasi" element={<VerifikasiPenjual />} />
        <Route path="pengguna" element={<KelolaPengguna />} />
        <Route path="kategori" element={<KelolaKategori />} />
        <Route path="transaksi" element={<MonitoringTransaksi />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}