
export default function Avatar({ foto, size = 64, nama = "" }) {
  const gaya = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#e5e7eb",
    color: "#9ca3af",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  };

  return (
    <div style={gaya}>
      {foto ? (
        <img
          src={foto}
          alt={nama ? `Foto profil ${nama}` : "Foto profil"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          width={size * 0.6}
          height={size * 0.6}
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
        </svg>
      )}
    </div>
  );
}