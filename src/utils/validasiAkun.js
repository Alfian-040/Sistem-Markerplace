// Validasi bagian akun (dipakai pembeli dan penjual)
export const validasiAkun = (form, akun) => {
  const e = {};
  const email = form.email.trim().toLowerCase();

  if (!form.nama.trim()) e.nama = "Nama wajib diisi.";
  if (!email) e.email = "Email wajib diisi.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Format email tidak valid.";
  else if (akun.some((a) => a.email.toLowerCase() === email)) e.email = "Email sudah terdaftar.";
  if (form.password.length < 8) e.password = "Password minimal 8 karakter.";
  if (form.konfirmasi !== form.password) e.konfirmasi = "Konfirmasi password tidak sama.";
  return e;
};
