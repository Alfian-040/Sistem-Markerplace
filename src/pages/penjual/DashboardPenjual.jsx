import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";
import { KOMISI_AWAL, rincian } from "../../utils/komisi";

// kunci tanggal lokal (YYYY-MM-DD), supaya pesanan tidak bergeser hari karena zona waktu
const kunci = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const hariTerakhir = (n) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i));
    return {
      kunci: kunci(d),
      label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      nilai: 0,
    };
  });
};

const singkat = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".0", "")} jt` : n >= 1e3 ? `${Math.round(n / 1e3)} rb` : String(n);

function Diagram({ judul, data, total, format, warna }) {
  const maks = Math.max(...data.map((d) => d.nilai), 0);
  const panjang = data.length > 7;
  return (
    <div className="card isi-card chart-card">
      <div className="chart-head">
        <h2>{judul}</h2>
        <strong>{total}</strong>
      </div>
      {maks === 0 ? (
        <p className="kosong">Belum ada data pada periode ini.</p>
      ) : (
        <div
          className="chart"
          role="img"
          aria-label={`${judul}: ${data.map((d) => `${d.label} ${format(d.nilai)}`).join(", ")}`}
        >
          {data.map((d, i) => (
            <div className="chart-col" key={d.kunci} title={`${d.label}: ${format(d.nilai)}`}>
              <span className="chart-val">{!panjang && d.nilai > 0 ? singkat(d.nilai) : ""}</span>
              <div className="chart-area">
                <div
                  className={`chart-bar ${warna}`}
                  style={{ height: d.nilai > 0 ? `${Math.max((d.nilai / maks) * 100, 3)}%` : 0 }}
                />
              </div>
              <span className="chart-label">{!panjang || i % 5 === 0 ? d.label : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPenjual() {
  const { db, pengguna } = useStore();
  const [hari, setHari] = useState(7);

  const pes = db.pesanan.filter((o) => o.penjualId === pengguna.id);

  // pendapatan bersih = total pesanan selesai dikurangi komisi marketplace
  const persen = db.pengaturan?.komisi ?? KOMISI_AWAL;
  const selesai = pes.filter((o) => o.status === "selesai");
  const kotor = selesai.reduce((t, o) => t + o.total, 0);
  const potongan = selesai.reduce((t, o) => t + rincian(o, persen).komisi, 0);
  const pendapatan = kotor - potongan;

  // [label, nilai, tujuan, warna solid, warna muda]
  const menu = [
    ["Produk", db.produk.filter((p) => p.penjualId === pengguna.id).length, "/penjual/produk", "#2563eb", "#dbeafe"],
    ["Pesanan baru", pes.filter((o) => o.status === "menunggu_konfirmasi").length, "/penjual/pesanan", "#ea580c", "#ffedd5"],
    ["Pesanan diproses", pes.filter((o) => o.status === "diproses" || o.status === "dalam_pengiriman").length, "/penjual/pesanan", "#7c3aed", "#ede9fe"],
    ["Pendapatan bersih", rupiah(pendapatan), "/penjual/riwayat", "#16a34a", "#dcfce7"],
  ];

  // Pesanan masuk per hari: semua pesanan yang sudah sampai ke penjual (sudah dibayar pembeli)
  const masuk = hariTerakhir(hari);
  const uang = hariTerakhir(hari);
  pes.forEach((o) => {
    const k = kunci(new Date(o.tanggal));
    if (o.status !== "menunggu_pembayaran") {
      const b = masuk.find((x) => x.kunci === k);
      if (b) b.nilai += 1;
    }
    if (o.status === "selesai") {
      const b = uang.find((x) => x.kunci === k);
      if (b) b.nilai += rincian(o, persen).bersih;
    }
  });
  const totalMasuk = masuk.reduce((t, d) => t + d.nilai, 0);
  const totalUang = uang.reduce((t, d) => t + d.nilai, 0);

  return (
    <>
      <h1 className="judul">Pengelolaan Toko</h1>
      <p className="mu">{pengguna.namaToko}</p>

      <nav className="stat-nav" aria-label="Ringkasan toko">
        {menu.map(([label, nilai, ke, warna, muda]) => (
          <Link key={label} to={ke} className="stat-nav-item" style={{ "--w": warna, "--w-muda": muda }}>
            <span className="stat-nav-label">{label}</span>
            <strong className="stat-nav-nilai">{nilai}</strong>
          </Link>
        ))}
      </nav>

      <div className="chart-bar-atas">
        <h2 className="sub">Ringkasan penjualan</h2>
        <div className="chips" role="group" aria-label="Periode diagram">
          {[7, 30].map((n) => (
            <button key={n} type="button" className={n === hari ? "chip active" : "chip"} onClick={() => setHari(n)}>
              {n} hari
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid">
        <Diagram
          judul="Pesanan masuk"
          data={masuk}
          total={`${totalMasuk} pesanan`}
          format={(n) => `${n} pesanan`}
          warna="chart-bar-pesanan"
        />
        <Diagram
          judul="Pendapatan bersih"
          data={uang}
          total={rupiah(totalUang)}
          format={rupiah}
          warna="chart-bar-uang"
        />
      </div>
      <p className="mu">
        Pendapatan bersih = total pesanan selesai ({rupiah(kotor)}) dikurangi komisi marketplace ({rupiah(potongan)}),
        per tanggal pesanan dibuat. Komisi saat ini {persen}%.
      </p>
    </>
  );
}