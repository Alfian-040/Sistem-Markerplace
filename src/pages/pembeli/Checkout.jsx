import { useEffect, useState } from "react";
import { useStore } from "../../context/Store";

const API = "https://www.emsifa.com/api-wilayah-indonesia/v2";
const kosong = {
  penerima: "",
  telepon: "",
  alamat: "",
  provinsi: "",
  kota: "",
  kecamatan: "",
  kodePos: "",
  jenis: "Rumah",
};

export default function Alamat() {
  const { db, pengguna, aksi } = useStore();
  const saya = db.alamat.filter((a) => a.pembeliId === pengguna.id);

  const [form, setForm] = useState(kosong);
  const [err, setErr] = useState("");
  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [desa, setDesa] = useState([]);
  const [bukaForm, setBukaForm] = useState(false);
  const [memuat, setMemuat] = useState(false);

  useEffect(() => {
    fetch(`${API}/provinces.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Gagal mengambil data provinsi.");
        return r.json();
      })
      .then((r) => setProvinsi(r.data))
      .catch(() => setErr("Data provinsi gagal dimuat. Periksa koneksi internet."));
  }, []);

  const ubah = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pilihProvinsi = async (e) => {
    const id = e.target.value;
    setForm((f) => ({
      ...f,
      provinsi: provinsi.find((p) => p.id === id)?.name || "",
      kota: "",
      kecamatan: "",
      kodePos: "",
    }));
    setKota([]);
    setKecamatan([]);
    setDesa([]);
    if (!id) return;

    try {
      const r = await fetch(`${API}/regencies/${id}.json`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setKota(data.data);
    } catch {
      setErr("Data kota/kabupaten gagal dimuat.");
    }
  };

  const pilihKota = async (e) => {
    const id = e.target.value;
    setForm((f) => ({
      ...f,
      kota: kota.find((k) => k.id === id)?.name || "",
      kecamatan: "",
      kodePos: "",
    }));
    setKecamatan([]);
    setDesa([]);
    if (!id) return;

    try {
      const r = await fetch(`${API}/districts/${id}.json`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setKecamatan(data.data);
    } catch {
      setErr("Data kecamatan gagal dimuat.");
    }
  };

  const pilihKecamatan = async (e) => {
    const id = e.target.value;
    setForm((f) => ({
      ...f,
      kecamatan: kecamatan.find((k) => k.id === id)?.name || "",
      kodePos: "",
    }));
    setDesa([]);
    if (!id) return;

    try {
      const r = await fetch(`${API}/villages/${id}.json`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setDesa(data.data);
    } catch {
      setErr("Data kelurahan/desa gagal dimuat.");
    }
  };

  const pilihDesa = (e) => {
    const d = desa.find((x) => x.id === e.target.value);
    setForm((f) => ({ ...f, kodePos: d?.postal_code || "" }));
  };

  const simpan = (e) => {
    e.preventDefault();

    if (
      !form.penerima.trim() ||
      !form.telepon.trim() ||
      !form.alamat.trim() ||
      !form.provinsi ||
      !form.kota ||
      !form.kecamatan ||
      !form.kodePos
    ) {
      setErr("Semua kolom wajib diisi, termasuk kode pos.");
      return;
    }

    setMemuat(true);
    aksi.simpanAlamat({
      ...form,
      penerima: form.penerima.trim(),
      telepon: form.telepon.trim(),
      alamat: `${form.alamat.trim()}, Kecamatan ${form.kecamatan}, ${form.kota}, ${form.provinsi}, ${form.kodePos}`,
    });
    setForm(kosong);
    setErr("");
    setBukaForm(false);
    setMemuat(false);
  };

  const edit = (a) => {
    setForm({ ...kosong, ...a });
    setErr("Untuk mengubah alamat, pilih kembali provinsi, kota, kecamatan, dan kode pos.");
    setBukaForm(true);
  };

  const hapus = (id) => {
    if (window.confirm("Hapus alamat ini?")) aksi.hapusAlamat(id);
  };

  return (
    <section>
      <h1 className="judul">Alamat Pengiriman</h1>

      {saya.map((a) => (
        <div className="card isi-card" key={a.id}>
          <strong>{a.penerima}</strong> · {a.telepon}
          <p>{a.alamat}</p>
          <span>{a.jenis || "Alamat"}</span>
          <div className="aksi-row">
            <button type="button" className="btn btn-sm" onClick={() => edit(a)}>
              Ubah
            </button>
            <button type="button" className="btn btn-sm" onClick={() => hapus(a.id)}>
              Hapus
            </button>
          </div>
        </div>
      ))}

      {!bukaForm ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setForm(kosong);
            setErr("");
            setBukaForm(true);
          }}
        >
          + Tambah Alamat Baru
        </button>
      ) : (
        <form className="card isi-card" onSubmit={simpan}>
          <h2>Alamat Baru</h2>

          {err && <p className="alert" role="alert">{err}</p>}

          <div className="field">
            <label htmlFor="penerima">Nama penerima</label>
            <input id="penerima" name="penerima" value={form.penerima} onChange={ubah} />
          </div>

          <div className="field">
            <label htmlFor="telepon">Nomor telepon</label>
            <input id="telepon" name="telepon" value={form.telepon} onChange={ubah} />
          </div>

          <div className="field">
            <label htmlFor="provinsi">Provinsi</label>
            <select id="provinsi" value={provinsi.find((p) => p.name === form.provinsi)?.id || ""} onChange={pilihProvinsi}>
              <option value="">Pilih provinsi</option>
              {provinsi.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="kota">Kota/Kabupaten</label>
            <select id="kota" value={kota.find((k) => k.name === form.kota)?.id || ""} onChange={pilihKota} disabled={!kota.length}>
              <option value="">Pilih kota/kabupaten</option>
              {kota.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="kecamatan">Kecamatan</label>
            <select id="kecamatan" value={kecamatan.find((k) => k.name === form.kecamatan)?.id || ""} onChange={pilihKecamatan} disabled={!kecamatan.length}>
              <option value="">Pilih kecamatan</option>
              {kecamatan.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="desa">Kelurahan/Desa</label>
            <select id="desa" value={desa.find((d) => d.postal_code === form.kodePos)?.id || ""} onChange={pilihDesa} disabled={!desa.length}>
              <option value="">Pilih kelurahan/desa</option>
              {desa.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="kodePos">Kode Pos</label>
            <input id="kodePos" name="kodePos" value={form.kodePos} onChange={ubah} />
          </div>

          <div className="field">
            <label htmlFor="alamat">Detail alamat (nama jalan, nomor rumah, patokan)</label>
            <textarea id="alamat" name="alamat" value={form.alamat} onChange={ubah} />
          </div>

          <div className="field">
            <label>Tandai Sebagai:</label>
            <div className="aksi-row">
              {["Rumah", "Kantor"].map((jenis) => (
                <button
                  key={jenis}
                  type="button"
                  className={`btn ${form.jenis === jenis ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setForm((f) => ({ ...f, jenis }))}
                >
                  {jenis}
                </button>
              ))}
            </div>
          </div>

          <div className="aksi-row">
            <button type="button" className="btn btn-ghost" onClick={() => {
              setBukaForm(false);
              setForm(kosong);
              setErr("");
            }}>
              Nanti Saja
            </button>
            <button type="submit" className="btn btn-primary" disabled={memuat}>
              OK
            </button>
          </div>
        </form>
      )}
    </section>
  );
}