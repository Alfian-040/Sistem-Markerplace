import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";

export default function VerifikasiPenjual() {
  const { db, aksi } = useStore();
  const rows = db.akun.filter((a) => a.peran === "penjual" && a.status === "menunggu").map((a) => [
    a.namaToko, a.nama, a.email, a.telepon, a.alamat,
    <span className="aksi-row" key="a">
      <button type="button" className="btn btn-primary btn-sm" onClick={() => aksi.ubahAkun(a.id, { status: "aktif" })}>Setujui</button>
      <button type="button" className="btn btn-sm" onClick={() => window.confirm("Tolak pendaftaran ini?") && aksi.ubahAkun(a.id, { status: "ditolak" })}>Tolak</button>
    </span>,
  ]);
  return (
    <>
      <h1 className="judul">Verifikasi Penjual</h1>
      <Tabel heads={["Toko", "Pemilik", "Email", "Telepon", "Alamat", "Aksi"]} rows={rows} kosong="Tidak ada pendaftaran yang menunggu." />
    </>
  );
}
