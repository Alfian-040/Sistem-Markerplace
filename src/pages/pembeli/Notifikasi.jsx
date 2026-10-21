import { useStore } from "../../context/Store";
import { tanggal } from "../../utils/format";

export default function Notifikasi() {
  const { db, pengguna, aksi } = useStore();
  const saya = db.notif.filter((n) => n.userId === pengguna.id).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return (
    <section className="container section">
      <h1 className="judul">Notifikasi</h1>
      {saya.some((n) => !n.dibaca) && <button type="button" className="btn btn-outline btn-sm" onClick={aksi.bacaSemuaNotif}>Tandai semua sudah dibaca</button>}
      {saya.length === 0 && <p className="kosong">Belum ada notifikasi.</p>}
      {saya.map((n) => (
        <div key={n.id} className={n.dibaca ? "notif" : "notif baru"}>
          <p>{n.pesan}</p><span className="mu">{tanggal(n.tanggal)}</span>
        </div>
      ))}
    </section>
  );
}
