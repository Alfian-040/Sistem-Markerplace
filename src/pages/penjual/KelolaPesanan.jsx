import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge";
import { useStore } from "../../context/Store";
import { rupiah, tanggal } from "../../utils/format";

export default function KelolaPesanan() {
  const { db, pengguna, aksi } = useStore();
  const [resi, setResi] = useState({});
  const daftar = db.pesanan
    .filter((o) => o.penjualId === pengguna.id && ["menunggu_konfirmasi", "diproses", "dalam_pengiriman"].includes(o.status))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const tolak = (id) => {
    const alasan = window.prompt("Alasan menolak pesanan:");
    if (alasan && alasan.trim()) aksi.tolak(id, alasan.trim());
  };
  const kirim = (id) => {
    if (!(resi[id] || "").trim()) return window.alert("Isi nomor resi atau info kurir.");
    aksi.kirim(id, resi[id].trim());
  };
  return (
    <>
      <h1 className="judul">Pesanan Masuk</h1>
      {daftar.length === 0 && <p className="kosong">Tidak ada pesanan yang perlu diproses.</p>}
      {daftar.map((o) => (
        <div className="card isi-card" key={o.id}>
          <div className="baris-atas"><strong>{db.akun.find((a) => a.id === o.pembeliId)?.nama}</strong><StatusBadge status={o.status} /></div>
          <p className="mu">{tanggal(o.tanggal)} · No. {String(o.id).slice(-6)} · {o.dibayar ? "Sudah dibayar" : "Belum dibayar"}</p>
          <ul>{o.items.map((i) => <li key={i.produkId}>{i.nama} x{i.jumlah} — {rupiah(i.harga * i.jumlah)}</li>)}</ul>
          <p><strong>Total {rupiah(o.total)}</strong></p>
          <p className="mu">Alamat: {o.alamat}</p>
          <div className="aksi-row">
            {o.status === "menunggu_konfirmasi" && (<>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => aksi.terima(o.id)}>Terima Pesanan</button>
              <button type="button" className="btn btn-sm" onClick={() => tolak(o.id)}>Tolak Pesanan</button>
            </>)}
            {o.status === "diproses" && (<>
              <input className="input-sm" placeholder="Nomor resi / info kurir" value={resi[o.id] || ""} onChange={(e) => setResi((r) => ({ ...r, [o.id]: e.target.value }))} />
              <button type="button" className="btn btn-primary btn-sm" onClick={() => kirim(o.id)}>Kirim Pesanan</button>
            </>)}
            {o.status === "dalam_pengiriman" && <span>Resi: <strong>{o.resi}</strong> (menunggu konfirmasi pembeli)</span>}
          </div>
        </div>
      ))}
    </>
  );
}
