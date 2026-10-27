// Kecilkan foto (sisi terpanjang maks 800px) dan simpan sebagai JPEG ringan,
// supaya localStorage tidak cepat penuh.
export const olahFoto = (file, sisiMaks = 800) =>
  new Promise((ok, gagal) => {
    const baca = new FileReader();
    baca.onerror = gagal;
    baca.onload = () => {
      const img = new Image();
      img.onerror = gagal;
      img.onload = () => {
        const skala = Math.min(1, sisiMaks / Math.max(img.width, img.height));
        const kanvas = document.createElement("canvas");
        kanvas.width = Math.round(img.width * skala);
        kanvas.height = Math.round(img.height * skala);
        const ctx = kanvas.getContext("2d");
        ctx.fillStyle = "#fff"; // PNG transparan jadi latar putih
        ctx.fillRect(0, 0, kanvas.width, kanvas.height);
        ctx.drawImage(img, 0, 0, kanvas.width, kanvas.height);
        ok(kanvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = baca.result;
    };
    baca.readAsDataURL(file);
  });