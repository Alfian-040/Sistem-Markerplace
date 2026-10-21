import StatusBadge from "../../components/common/StatusBadge";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";
import { rupiah, tanggal } from "../../utils/format";
import { KOMISI_AWAL, rincian } from "../../utils/komisi";

export default function RiwayatTransaksi() {
  const { db, pengguna } = useStore();
  const persen = db.pengaturan?.komisi ?? KOMISI_AWAL;
  const rows = db.pesanan
    .filter((o) => o.penjualId === pengguna.id && ["selesai", "dibatalkan"].includes(o.status))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .map((o) => {
      const selesai = o.status === "selesai";
      const r = rincian(o, persen);
      return [
        tanggal(o.tanggal),
        db.akun.find((a) => a.id === o.pembeliId)?.nama,
        o.items.map((i) => `${i.nama} x${i.jumlah}`).join(", "),
        rupiah(o.total),
        selesai ? `${rupiah(r.komisi)} (${r.persen}%)` : "-",
        selesai ? rupiah(r.bersih) : "-",
        <StatusBadge key="s" status={o.status} />,
      ];
    });
  return (
    <>
      <h1 className="judul">Riwayat Transaksi</h1>
      <Tabel heads={["Tanggal", "Pembeli", "Produk", "Total", "Komisi", "Diterima", "Status"]} rows={rows} kosong="Belum ada transaksi selesai." />
    </>
  );
}