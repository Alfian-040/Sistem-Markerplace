export const kategoriAwal = [
  { id: 1, nama: "Makanan" },
  { id: 2, nama: "Fashion" },
  { id: 3, nama: "Kerajinan" },
  { id: 4, nama: "Kecantikan" },
];

const p = (id, nama, kategori, harga, stok, deskripsi) => ({ id, penjualId: 2, nama, kategori, harga, stok, deskripsi });

export const produkAwal = [
  p(101, "Keripik Tempe Balado", "Makanan", 18000, 40, "Keripik tempe renyah dengan bumbu balado pedas manis."),
  p(102, "Kopi Robusta Gayo 250 g", "Makanan", 55000, 25, "Biji kopi robusta pilihan, sangrai medium."),
  p(103, "Kain Batik Tulis Parang", "Fashion", 285000, 6, "Kain batik tulis motif parang, ukuran 2 meter."),
  p(104, "Tas Anyaman Pandan", "Kerajinan", 120000, 12, "Tas anyaman pandan buatan tangan."),
  p(105, "Sabun Herbal Lavender", "Kecantikan", 25000, 60, "Sabun batang herbal dengan aroma lavender."),
  p(106, "Syal Tenun Ikat", "Fashion", 175000, 0, "Syal tenun ikat tradisional."),
  p(107, "Vas Gerabah Mini", "Kerajinan", 45000, 18, "Vas gerabah mini untuk meja kerja."),
  p(108, "Sambal Roa Botol", "Makanan", 35000, 30, "Sambal roa khas, tahan lama."),
];
