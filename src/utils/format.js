export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
export const tanggal = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
export const STATUS = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dalam_pengiriman: "Dalam Pengiriman",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};
