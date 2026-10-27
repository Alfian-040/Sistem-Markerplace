// Komisi marketplace: dipotong dari total pesanan yang selesai.
export const KOMISI_AWAL = 5; // persen, bisa diubah pemilik di menu Pengaturan Komisi

export const hitungKomisi = (total, persen) => Math.round((total * persen) / 100);

// Pesanan lama (dibuat sebelum fitur komisi) belum punya angka tersimpan,
// jadi dihitung dari persentase yang berlaku sekarang.
export const rincian = (o, persenSaatIni) => {
  const persen = o.komisiPersen ?? persenSaatIni;
  const komisi = o.komisi ?? hitungKomisi(o.total, persen);
  return { persen, komisi, bersih: o.bersih ?? o.total - komisi };
};