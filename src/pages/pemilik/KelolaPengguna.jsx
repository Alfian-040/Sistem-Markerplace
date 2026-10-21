import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";

export default function KelolaPengguna() {
  const { db, aksi } = useStore();

  const rows = db.akun
    .filter((a) => a.peran !== "pemilik")
    .map((a) => [
      a.nama,
      a.email,
      a.peran,
      a.status,
      <span className="aksi-row" key="a">
        {/* Akun "menunggu" atau "ditolak" diatur lewat menu Verifikasi Penjual */}
        {(a.status === "aktif" || a.status === "nonaktif") && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              aksi.ubahAkun(a.id, { status: a.status === "aktif" ? "nonaktif" : "aktif" })
            }
          >
            {a.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => window.confirm("Hapus pengguna ini?") && aksi.hapusAkun(a.id)}
        >
          Hapus
        </button>
      </span>,
    ]);

  return (
    <>
      <h1 className="judul">Kelola Pengguna</h1>
      <p className="mu">
        Pengguna mendaftar sendiri lewat halaman Daftar. Pemilik hanya dapat
        menonaktifkan, mengaktifkan, atau menghapus akun.
      </p>
      <Tabel heads={["Nama", "Email", "Role", "Status", "Aksi"]} rows={rows} kosong="Belum ada pengguna." />
    </>
  );
}