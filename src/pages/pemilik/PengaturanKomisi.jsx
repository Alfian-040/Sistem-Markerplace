import { useState } from "react";
import { useStore } from "../../context/Store";
import { rupiah } from "../../utils/format";
import { KOMISI_AWAL, hitungKomisi } from "../../utils/komisi";

const CONTOH = 100000;

export default function PengaturanKomisi() {
  const { db, aksi } = useStore();
  const saatIni = db.pengaturan?.komisi ?? KOMISI_AWAL;
  const [nilai, setNilai] = useState(String(saatIni));
  const [err, setErr] = useState("");
  const [pesan, setPesan] = useState("");

  const angka = Number(nilai);
  const valid = nilai.trim() !== "" && Number.isFinite(angka) && angka >= 0 && angka <= 100;
  const komisiContoh = valid ? hitungKomisi(CONTOH, angka) : 0;

  const simpan = (e) => {
    e.preventDefault();
    const r = aksi.ubahKomisi(nilai);
    if (r.pesan) {
      setPesan("");
      return setErr(r.pesan);
    }
    setErr("");
    setPesan("Persentase komisi berhasil disimpan.");
  };

  return (
    <>
      <h1 className="judul">Pengaturan Komisi</h1>
      <p className="mu">
        Komisi dipotong dari total pesanan yang berstatus selesai. Perubahan hanya berlaku untuk
        pesanan yang selesai setelah ini; pesanan yang sudah selesai tidak berubah.
      </p>

      <form className="card isi-card form-sempit" onSubmit={simpan} noValidate>
        {err && <p className="alert" role="alert">{err}</p>}
        {pesan && <p className="alert alert-ok" role="status">{pesan}</p>}

        <div className="field">
          <label htmlFor="komisi">Komisi marketplace (%)</label>
          <input
            id="komisi"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={nilai}
            onChange={(e) => { setNilai(e.target.value); setErr(""); setPesan(""); }}
            aria-invalid={err ? "true" : "false"}
          />
          <span className="field-hint">Angka 0 sampai 100. Saat ini {saatIni}%.</span>
        </div>

        {valid && (
          <p className="mu">
            Contoh: pesanan {rupiah(CONTOH)} → komisi {rupiah(komisiContoh)}, penjual menerima {rupiah(CONTOH - komisiContoh)}.
          </p>
        )}

        <button type="submit" className="btn btn-primary">Simpan</button>
      </form>
    </>
  );
}