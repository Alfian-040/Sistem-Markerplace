import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { akunAwal } from "../data/akun";
import { kategoriAwal, produkAwal } from "../data/produk";
import { KOMISI_AWAL, hitungKomisi } from "../utils/komisi";

const KEY = "pasarumkm-db-v3";
const KEY_USER = "pasarumkm-user-v3";
const awal = { akun: akunAwal, kategori: kategoriAwal, produk: produkAwal, alamat: [], pesanan: [], notif: [], keranjang: {}, pengaturan: { komisi: KOMISI_AWAL } };
const muat = () => {
  try { return { ...awal, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch { return awal; }
};
let seq = 0;
const uid = () => Date.now() * 100 + (seq++ % 100);
const sekarang = () => new Date().toISOString();
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [db, setDb] = useState(muat);
  const [userId, setUserId] = useState(() => Number(localStorage.getItem(KEY_USER)) || null);
  // true sesaat setelah tombol Keluar ditekan, supaya penjaga halaman mengarahkan ke Beranda (bukan ke Masuk)
  const [baruKeluar, setBaruKeluar] = useState(false);
  const lokasi = useLocation();

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(db)), [db]);
  useEffect(() => {
    if (baruKeluar && lokasi.pathname === "/") setBaruKeluar(false);
  }, [baruKeluar, lokasi.pathname]);
  useEffect(() => {
    if (userId) localStorage.setItem(KEY_USER, String(userId));
    else localStorage.removeItem(KEY_USER);
  }, [userId]);

  const pengguna = db.akun.find((a) => a.id === userId && a.status === "aktif") || null;
  const ubah = (fn) => setDb((d) => ({ ...d, ...fn(d) }));
  const catat = (d, untuk, pesan, pesananId) => [
    ...d.notif,
    { id: uid(), userId: untuk, pesan, pesananId, dibaca: false, tanggal: sekarang() },
  ];
  const ubahPesanan = (id, fn, pesanNotif, untuk) =>
    ubah((d) => {
      const x = d.pesanan.find((o) => o.id === id);
      return {
        pesanan: d.pesanan.map((o) => (o.id === id ? { ...o, ...fn(o) } : o)),
        notif: pesanNotif ? catat(d, untuk(x), pesanNotif, id) : d.notif,
      };
    });
  const keranjang = (db.keranjang[userId] || [])
    .map((i) => ({ ...i, produk: db.produk.find((p) => p.id === i.produkId) }))
    .filter((i) => i.produk);
  const setKeranjang = (fn) =>
    ubah((d) => ({ keranjang: { ...d.keranjang, [userId]: fn(d.keranjang[userId] || []) } }));

  const aksi = {
    masuk(email, password) {
      const a = db.akun.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
      if (!a) return { pesan: "Email atau password salah." };
      if (a.status === "menunggu") return { pesan: "Akun penjual Anda belum disetujui pemilik marketplace." };
      if (a.status === "ditolak") return { pesan: "Pendaftaran akun Anda ditolak pemilik marketplace." };
      if (a.status !== "aktif") return { pesan: "Akun Anda dinonaktifkan. Hubungi pemilik marketplace." };
      setBaruKeluar(false);
      setUserId(a.id);
      return { akun: a };
    },
    keluar: () => {
      setBaruKeluar(true);
      setUserId(null);
    },
    daftar: (a) => ubah((d) => ({ akun: [...d.akun, { ...a, id: uid() }] })),
    ubahAkun: (id, patch) => ubah((d) => ({ akun: d.akun.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

    // Akun Saya: ubah profil milik pengguna yang sedang masuk
    ubahProfil(patch) {
      const u = (patch.username || "").trim().toLowerCase();
      if (u && db.akun.some((a) => a.id !== userId && (a.username || "").toLowerCase() === u)) {
        return { pesan: "Username sudah dipakai pengguna lain." };
      }
      ubah((d) => ({ akun: d.akun.map((a) => (a.id === userId ? { ...a, ...patch } : a)) }));
      return {};
    },
    // Akun Saya: ganti password (wajib mengisi password lama)
    ubahPassword(lama, baru) {
      const a = db.akun.find((x) => x.id === userId);
      if (!a || a.password !== lama) return { pesan: "Password saat ini salah." };
      ubah((d) => ({ akun: d.akun.map((x) => (x.id === userId ? { ...x, password: baru } : x)) }));
      return {};
    },
    hapusAkun: (id) =>
      ubah((d) => ({ akun: d.akun.filter((a) => a.id !== id), produk: d.produk.filter((p) => p.penjualId !== id) })),

    // Kategori toko: milik penjual yang sedang masuk, tidak dibagi ke penjual lain
    simpanKategoriToko(nama, lama) {
      const n = nama.trim();
      const saya = db.akun.find((a) => a.id === userId);
      const daftar = saya?.kategoriToko || [];
      if (!n) return { pesan: "Nama kategori toko wajib diisi." };
      if (daftar.some((k) => k.toLowerCase() === n.toLowerCase() && k !== lama))
        return { pesan: "Kategori toko sudah ada." };
      ubah((d) => ({
        akun: d.akun.map((a) =>
          a.id === userId
            ? {
                ...a,
                kategoriToko: lama
                  ? (a.kategoriToko || []).map((k) => (k === lama ? n : k))
                  : [...(a.kategoriToko || []), n],
              }
            : a,
        ),
        // ganti nama hanya merambat ke produk milik penjual ini
        produk: lama
          ? d.produk.map((p) =>
              p.penjualId === userId && p.kategoriToko === lama ? { ...p, kategoriToko: n } : p,
            )
          : d.produk,
      }));
      return {};
    },
    hapusKategoriToko: (nama) =>
      ubah((d) => ({
        akun: d.akun.map((a) =>
          a.id === userId ? { ...a, kategoriToko: (a.kategoriToko || []).filter((k) => k !== nama) } : a,
        ),
        // produk yang memakai kategori ini menjadi "tanpa kategori toko"
        produk: d.produk.map((p) =>
          p.penjualId === userId && p.kategoriToko === nama ? { ...p, kategoriToko: "" } : p,
        ),
      })),

    simpanKategori: (k) =>
      ubah((d) => {
        if (!k.id) return { kategori: [...d.kategori, { id: uid(), nama: k.nama }] };
        const lama = d.kategori.find((x) => x.id === k.id).nama;
        return {
          kategori: d.kategori.map((x) => (x.id === k.id ? k : x)),
          produk: d.produk.map((p) => (p.kategori === lama ? { ...p, kategori: k.nama } : p)),
        };
      }),
    hapusKategori(id) {
      const k = db.kategori.find((x) => x.id === id);
      if (db.produk.some((p) => p.kategori === k.nama)) return "Kategori masih dipakai produk, tidak dapat dihapus.";
      ubah((d) => ({ kategori: d.kategori.filter((x) => x.id !== id) }));
      return "";
    },

    simpanProduk: (p) =>
      ubah((d) => ({ produk: p.id ? d.produk.map((x) => (x.id === p.id ? p : x)) : [...d.produk, { ...p, id: uid() }] })),
    hapusProduk: (id) => ubah((d) => ({ produk: d.produk.filter((p) => p.id !== id) })),

    // jumlah bawaan 1 (Beranda tetap bisa memanggil tanpa argumen kedua), dibatasi stok
    tambahKeranjang: (p, jumlah = 1) =>
      setKeranjang((k) => {
        const ada = k.find((i) => i.produkId === p.id);
        const sudah = ada ? ada.jumlah : 0;
        const baru = Math.min(sudah + jumlah, p.stok);
        if (baru <= sudah) return k;
        return ada
          ? k.map((i) => (i.produkId === p.id ? { ...i, jumlah: baru } : i))
          : [...k, { produkId: p.id, jumlah: baru }];
      }),
    ubahJumlah: (produkId, jumlah) =>
      setKeranjang((k) => k.map((i) => (i.produkId === produkId ? { ...i, jumlah } : i))),
    hapusKeranjang: (produkId) => setKeranjang((k) => k.filter((i) => i.produkId !== produkId)),

    simpanAlamat: (a) =>
      ubah((d) => ({
        alamat: a.id ? d.alamat.map((x) => (x.id === a.id ? a : x)) : [...d.alamat, { ...a, id: uid(), pembeliId: userId }],
      })),
    hapusAlamat: (id) => ubah((d) => ({ alamat: d.alamat.filter((a) => a.id !== id) })),

    // langsung = { produkId, jumlah } untuk "Beli Sekarang"; tanpa itu, pesanan dibuat dari keranjang
    buatPesanan(alamatId, langsung) {
      const k = langsung
        ? [{ produkId: langsung.produkId, jumlah: langsung.jumlah }]
        : db.keranjang[userId] || [];
      const al = db.alamat.find((a) => a.id === alamatId);
      if (!al) return { pesan: "Pilih alamat pengiriman terlebih dahulu." };
      if (k.length === 0) return { pesan: "Tidak ada produk untuk dipesan." };
      const kurang = k.some((i) => {
        const p = db.produk.find((x) => x.id === i.produkId);
        return !p || p.stok < i.jumlah;
      });
      if (kurang) {
        // pembelian langsung: keranjang tidak disentuh
        if (!langsung) {
          setKeranjang((lama) =>
            lama
              .map((i) => {
                const p = db.produk.find((x) => x.id === i.produkId);
                return { ...i, jumlah: Math.min(i.jumlah, p ? p.stok : 0) };
              })
              .filter((i) => i.jumlah > 0),
          );
        }
        return { pesan: "Stok produk tidak mencukupi. Periksa kembali jumlah pesanan." };
      }
      const grup = {};
      k.forEach((i) => {
        const p = db.produk.find((x) => x.id === i.produkId);
        (grup[p.penjualId] = grup[p.penjualId] || []).push({ produkId: p.id, nama: p.nama, harga: p.harga, jumlah: i.jumlah });
      });
      const baru = Object.entries(grup).map(([pj, items]) => ({
        id: uid(), pembeliId: userId, penjualId: Number(pj), items,
        total: items.reduce((t, i) => t + i.harga * i.jumlah, 0),
        alamat: `${al.penerima}, ${al.telepon}, ${al.alamat}`,
        status: "menunggu_pembayaran", dibayar: false, tanggal: sekarang(),
      }));
      ubah((d) => ({
        pesanan: [...d.pesanan, ...baru],
        produk: d.produk.map((p) => {
          const i = k.find((x) => x.produkId === p.id);
          return i ? { ...p, stok: p.stok - i.jumlah } : p;
        }),
        // keranjang hanya dikosongkan kalau checkout dari keranjang
        keranjang: langsung ? d.keranjang : { ...d.keranjang, [userId]: [] },
      }));
      return { ids: baru.map((b) => b.id) };
    },
    bayar: (id) =>
      ubahPesanan(id, () => ({ status: "menunggu_konfirmasi", dibayar: true }), "Pesanan baru menunggu konfirmasi Anda.", (o) => o.penjualId),
    terima: (id) =>
      ubahPesanan(id, () => ({ status: "diproses" }), "Pesanan Anda diterima penjual dan sedang diproses.", (o) => o.pembeliId),
    tolak: (id, alasan) =>
      ubah((d) => {
        const x = d.pesanan.find((o) => o.id === id);
        return {
          pesanan: d.pesanan.map((o) => (o.id === id ? { ...o, status: "dibatalkan", alasan, dikembalikan: o.dibayar } : o)),
          produk: d.produk.map((p) => {
            const i = x.items.find((it) => it.produkId === p.id);
            return i ? { ...p, stok: p.stok + i.jumlah } : p;
          }),
          notif: catat(d, x.pembeliId, `Pesanan dibatalkan penjual. Alasan: ${alasan}. Dana dikembalikan.`, id),
        };
      }),
    kirim: (id, resi) =>
      ubahPesanan(id, () => ({ status: "dalam_pengiriman", resi }), `Pesanan Anda dalam pengiriman. Resi: ${resi}.`, (o) => o.pembeliId),
    selesai: (id) =>
      ubahPesanan(
        id,
        (o) => {
          // komisi dikunci saat pesanan selesai, supaya perubahan persen nanti tidak mengubah pesanan lama
          const persen = db.pengaturan?.komisi ?? KOMISI_AWAL;
          const komisi = hitungKomisi(o.total, persen);
          return { status: "selesai", komisiPersen: persen, komisi, bersih: o.total - komisi };
        },
        "Pesanan telah selesai. Terima kasih sudah berbelanja.",
        (o) => o.penjualId,
      ),
    // Pemilik: atur persentase komisi marketplace (0 sampai 100)
    ubahKomisi(persen) {
      const n = Number(persen);
      if (String(persen).trim() === "" || !Number.isFinite(n) || n < 0 || n > 100)
        return { pesan: "Komisi harus berupa angka 0 sampai 100." };
      ubah((d) => ({ pengaturan: { ...d.pengaturan, komisi: n } }));
      return {};
    },
    bacaSemuaNotif: () =>
      ubah((d) => ({ notif: d.notif.map((n) => (n.userId === userId ? { ...n, dibaca: true } : n)) })),
  };

  return <Ctx.Provider value={{ db, pengguna, keranjang, aksi, baruKeluar }}>{children}</Ctx.Provider>;
}