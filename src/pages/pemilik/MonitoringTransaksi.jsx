import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";
import { STATUS, rupiah, tanggal } from "../../utils/format";
import { KOMISI_AWAL, rincian } from "../../utils/komisi";

export default function MonitoringTransaksi() {
  const { db } = useStore();
  const persen = db.pengaturan?.komisi ?? KOMISI_AWAL;
  const [status, setStatus] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [buka, setBuka] = useState(null);
  const nama = (id) => db.akun.find((a) => a.id === id);
  const komisiDari = (o) => (o.status === "selesai" ? rupiah(rincian(o, persen).komisi) : "-");
  const daftar = db.pesanan
    .filter((o) => (!status || o.status === status) && (!dari || o.tanggal.slice(0, 10) >= dari) && (!sampai || o.tanggal.slice(0, 10) <= sampai))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const rows = daftar.map((o) => [tanggal(o.tanggal), nama(o.pembeliId)?.nama, nama(o.penjualId)?.namaToko, rupiah(o.total), komisiDari(o), <StatusBadge key="s" status={o.status} />,
    <button key="d" type="button" className="btn btn-sm" onClick={() => setBuka(buka?.id === o.id ? null : o)}>Detail</button>]);
  return (
    <>
      <h1 className="judul">Monitoring Transaksi</h1>
      <div className="card isi-card baris-form">
        <label>Status <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Dari <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} /></label>
        <label>Sampai <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} /></label>
      </div>
      <Tabel heads={["Tanggal", "Pembeli", "Toko", "Total", "Komisi", "Status", "Aksi"]} rows={rows} kosong="Data transaksi tidak ditemukan." />
      {buka && (
        <div className="card isi-card">
          <h2>Detail transaksi No. {String(buka.id).slice(-6)}</h2>
          <p>Pembeli: {nama(buka.pembeliId)?.nama} · Penjual: {nama(buka.penjualId)?.namaToko}</p>
          <ul>{buka.items.map((i) => <li key={i.produkId}>{i.nama} x{i.jumlah} — {rupiah(i.harga * i.jumlah)}</li>)}</ul>
          <p>Total {rupiah(buka.total)} · Pembayaran: {buka.dibayar ? "sudah dibayar" : "belum dibayar"}{buka.resi ? ` · Resi ${buka.resi}` : ""}</p>
          {buka.status === "selesai" && (() => {
            const r = rincian(buka, persen);
            return <p>Komisi {r.persen}%: {rupiah(r.komisi)} · Diterima penjual: {rupiah(r.bersih)}</p>;
          })()}
          <p className="mu">Alamat: {buka.alamat}</p>
        </div>
      )}
    </>
  );
}