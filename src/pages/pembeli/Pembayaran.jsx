import { Link, useNavigate, useParams } from "react-router-dom";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";

export default function Pembayaran() {
  const { ids } = useParams();
  const { db, pengguna, aksi } = useStore();
  const navigate = useNavigate();
  const daftar = db.pesanan.filter((o) => ids.split(",").map(Number).includes(o.id) && o.pembeliId === pengguna.id);
  const belum = daftar.filter((o) => o.status === "menunggu_pembayaran");
  const total = belum.reduce((t, o) => t + o.total, 0);

  const bayar = () => {
    belum.forEach((o) => aksi.bayar(o.id));
    navigate("/pesanan");
  };
  return (
    <section className="container section">
      <h1 className="judul">Pembayaran</h1>
      <Tabel heads={["Toko", "Rincian", "Total"]} rows={belum.map((o) => [db.akun.find((a) => a.id === o.penjualId)?.namaToko, o.items.map((i) => `${i.nama} x${i.jumlah}`).join(", "), rupiah(o.total)])} kosong="Tidak ada tagihan yang perlu dibayar." />
      {belum.length > 0 ? (
        <div className="total-bar">
          <strong>Total tagihan: {rupiah(total)}</strong>
          <button type="button" className="btn btn-primary" onClick={bayar}>Konfirmasi pembayaran</button>
        </div>
      ) : <p><Link to="/pesanan">Lihat pesanan saya</Link></p>}
      <p className="mu">Pembayaran disimulasikan: tombol konfirmasi dianggap pembayaran berhasil.</p>
    </section>
  );
}
