import { Link } from "react-router-dom";
import Tabel from "../../components/common/Tabel";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";

export default function Keranjang() {
  const { keranjang, aksi } = useStore();
  const total = keranjang.reduce((t, i) => t + i.produk.harga * i.jumlah, 0);
  const rows = keranjang.map(({ produk: p, jumlah }) => [
    p.nama, rupiah(p.harga),
    <span className="qty" key="q">
      <button type="button" className="btn btn-sm" disabled={jumlah <= 1} onClick={() => aksi.ubahJumlah(p.id, jumlah - 1)}>−</button>
      {jumlah}
      <button type="button" className="btn btn-sm" disabled={jumlah >= p.stok} onClick={() => aksi.ubahJumlah(p.id, jumlah + 1)}>+</button>
    </span>,
    rupiah(p.harga * jumlah),
    <button key="h" type="button" className="btn btn-sm" onClick={() => aksi.hapusKeranjang(p.id)}>Hapus</button>,
  ]);
  return (
    <section className="container section">
      <h1 className="judul">Keranjang</h1>
      <Tabel heads={["Produk", "Harga", "Jumlah", "Subtotal", "Aksi"]} rows={rows} kosong="Keranjang masih kosong." />
      {keranjang.length > 0 && (
        <div className="total-bar">
          <strong>Total: {rupiah(total)}</strong>
          <Link className="btn btn-primary" to="/checkout">Checkout</Link>
        </div>
      )}
    </section>
  );
}
