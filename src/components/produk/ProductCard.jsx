import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";

const inisial = (nama) => nama.split(" ").slice(0, 2).map((k) => k[0]).join("");

export default function ProductCard({ produk, toko, jumlahDiKeranjang, onTambah, nonaktif, linkToko = true }) {
  const { id, nama, kategori, harga, stok, penjualId, foto } = produk;
  const { pengguna } = useStore();
  const navigate = useNavigate();
  const habis = stok === 0;
  const maksimal = !habis && jumlahDiKeranjang >= stok;

  // Beli Sekarang: langsung ke Checkout dengan 1 produk ini, keranjang tidak berubah
  const beliSekarang = () => (pengguna ? navigate(`/checkout?beli=${id}&jumlah=1`) : navigate("/masuk"));

  return (
    <article className="card">
      <Link to={`/produk/${id}`} tabIndex={-1} aria-hidden="true">
        {foto?.[0] ? (
          <img className="card-foto" src={foto[0]} alt="" />
        ) : (
          <div className={`card-tile tile-${kategori.toLowerCase()}`}>{inisial(nama)}</div>
        )}
      </Link>
      <div className="card-body">
        <span className="card-kategori">{kategori}</span>
        <h3 className="card-nama"><Link to={`/produk/${id}`}>{nama}</Link></h3>
        <p className="card-toko">{linkToko ? <Link to={`/toko/${penjualId}`}>{toko}</Link> : toko}</p>
        <p className="card-harga">{rupiah(harga)}</p>
        <p className={habis ? "card-stok habis" : "card-stok"}>{habis ? "Stok habis" : `Stok ${stok}`}</p>
        <div className="card-aksi">
          <button
            type="button"
            className="btn btn-outline"
            disabled={habis || maksimal || nonaktif}
            onClick={() => onTambah(produk)}
            title={maksimal ? "Jumlah di keranjang sudah mencapai stok" : "Tambah ke keranjang"}
          >
            {habis ? "Stok habis" : maksimal ? "Maks. stok" : "+ Keranjang"}
          </button>
          <button type="button" className="btn btn-primary" disabled={habis || nonaktif} onClick={beliSekarang}>
            Beli Sekarang
          </button>
        </div>
      </div>
    </article>
  );
}