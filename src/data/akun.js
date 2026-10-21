// Data akun tiruan. Password teks biasa hanya untuk latihan frontend;
// saat ada backend, password wajib di-hash.
export const akunAwal = [
  { id: 1, nama: "Pemilik Marketplace", email: "pemilik@pasarumkm.id", password: "pemilik123", peran: "pemilik", status: "aktif" },
  {
    id: 2, nama: "Sari Wulandari", email: "sari@dapurbusari.id", password: "penjual123",
    peran: "penjual", status: "aktif", namaToko: "Dapur Bu Sari",
    telepon: "081234567890", alamat: "Jl. Melati No. 5, Yogyakarta", deskripsi: "Camilan dan sambal rumahan.",
  },
  {
    id: 3, nama: "Joko Santoso", email: "joko@anyaman.id", password: "penjual123",
    peran: "penjual", status: "menunggu", namaToko: "Anyaman Pak Joko",
    telepon: "081298765432", alamat: "Jl. Pandan No. 12, Klaten", deskripsi: "Kerajinan anyaman pandan.",
  },
  { id: 4, nama: "Budi Pembeli", email: "budi@mail.com", password: "pembeli123", peran: "pembeli", status: "aktif" },
];
