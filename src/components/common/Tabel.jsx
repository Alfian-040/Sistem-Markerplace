export default function Tabel({ heads, rows, kosong = "Belum ada data." }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)
          ) : (
            <tr><td colSpan={heads.length} className="kosong-cell">{kosong}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
