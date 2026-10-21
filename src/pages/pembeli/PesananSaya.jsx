import { Link } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge";
import { useStore } from "../../context/Store";
import { rupiah, tanggal } from "../../utils/format";

export default function PesananSaya({ riwayat = false }) {
  const { db, pengguna, aksi } = useStore();
  const akhir = (s) => s === "selesai" || s === "dibatalkan";
  const daftar = db.pesanan.filter((o) => o.pembeliId === pengguna.id && akhir(o.status) === riwayat).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return (
    <section className="container section">
      <h1 className="judul">{riwayat ? "Riwayat Pembelian" : "Pesanan Saya"}</h1>
      <p className="mu"><Link to={riwayat ? "/pesanan" : "/riwayat"}>{riwayat ? "← Pesanan aktif" : "Lihat riwayat pembelian →"}</Link></p>
      {daftar.length === 0 && <p className="kosong">{riwayat ? "Belum ada riwayat pesanan." : "Belum ada pesanan aktif."}</p>}
      {daftar.map((o) => (
        <div className="card isi-card" key={o.id}>
          <div className="baris-atas"><strong>{db.akun.find((a) => a.id === o.penjualId)?.namaToko}</strong><StatusBadge status={o.status} /></div>
          <p className="mu">{tanggal(o.tanggal)} · No. {String(o.id).slice(-6)}</p>
          <ul>{o.items.map((i) => <li key={i.produkId}>{i.nama} x{i.jumlah} — {rupiah(i.harga * i.jumlah)}</li>)}</ul>
          <p><strong>Total {rupiah(o.total)}</strong></p>
          <p className="mu">Dikirim ke: {o.alamat}</p>
          {o.resi && <p>Nomor resi: <strong>{o.resi}</strong></p>}
          {o.alasan && <p className="alert">Dibatalkan: {o.alasan}{o.dikembalikan ? " (dana dikembalikan)" : ""}</p>}
          <div className="aksi-row">
            {o.status === "menunggu_pembayaran" && <Link className="btn btn-primary btn-sm" to={`/pembayaran/${o.id}`}>Bayar</Link>}
            {o.status === "dalam_pengiriman" && <button type="button" className="btn btn-primary btn-sm" onClick={() => aksi.selesai(o.id)}>Pesanan Diterima</button>}
          </div>
        </div>
      ))}
    </section>
  );
}
