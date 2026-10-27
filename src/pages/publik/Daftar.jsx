import { Link } from "react-router-dom";

function Daftar() {
  return (
    <section className="form-page">
      <div className="form-card">
        <h1>Daftar</h1>
        <p className="form-intro">Pilih jenis akun yang ingin Anda buat.</p>

        <div className="pilihan-grid">
          <Link className="pilihan" to="/daftar/pembeli">
            <strong>Pembeli</strong>
            
          </Link>
          <Link className="pilihan" to="/daftar/penjual">
            <strong>Penjual</strong>
            
          </Link>
        </div>

        <p className="form-note" style={{ marginTop: 20 }}>
          Sudah punya akun? <Link to="/masuk">Masuk</Link>
        </p>
      </div>
    </section>
  );
}

export default Daftar;
