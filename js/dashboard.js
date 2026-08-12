/**
 * js/dashboard.js
 * Penanganan Statistik & Ringkasan Kedisiplinan Dashboard
 */

document.addEventListener("DOMContentLoaded", () => {
  // Verifikasi sesi & proteksi halaman saat pertama kali dimuat
  if (typeof Auth !== "undefined" && typeof Auth.checkAccess === "function") {
    Auth.checkAccess();
  }

  loadDashboardData();
});

async function loadDashboardData() {
  const elTotalSiswa = document.getElementById("dash-total-siswa");
  const elPelanggaran = document.getElementById("dash-pelanggaran-tahun-ini");
  const elPrestasi = document.getElementById("dash-prestasi-tahun-ini");
  const elTotalCatatan = document.getElementById("dash-total-catatan");
  const errorEl = document.getElementById("dashboard-error");

  try {
    // Pengamanan pemanggilan instance API (mendukung window.API / Api / ApiService)
    const api = window.API || window.Api || window.ApiService;
    if (!api || typeof api.getDashboardData !== "function") {
      throw new Error("Modul API tidak ditemukan atau fungsi getDashboardData tidak tersedia.");
    }

    // Panggil API getDashboardData
    const res = await api.getDashboardData();

    if (res && res.status === "success" && res.data) {
      const data = res.data;

      // Render nilai ke DOM dengan proteksi fallback nilai 0
      if (elTotalSiswa) elTotalSiswa.textContent = Number(data.total_siswa || 0).toLocaleString('id-ID');
      if (elPelanggaran) elPelanggaran.textContent = Number(data.total_pelanggaran || 0).toLocaleString('id-ID');
      if (elPrestasi) elPrestasi.textContent = Number(data.total_prestasi || 0).toLocaleString('id-ID');
      if (elTotalCatatan) elTotalCatatan.textContent = Number(data.total_catatan || 0).toLocaleString('id-ID');

      // Sembunyikan elemen error jika berhasil
      if (errorEl) errorEl.classList.add("hidden");
    } else {
      const msg = res ? res.message : "Gagal memuat data dashboard";

      // 1. Jika sesi server-side expired / tidak valid -> logout aman
      if (msg && (msg.includes("server-side tidak valid") || msg.includes("sesi telah berakhir"))) {
        if (typeof Auth !== "undefined" && typeof Auth.logout === "function") {
          alert("Sesi login Anda telah berakhir. Silakan login kembali.");
          Auth.logout();
          return;
        }
      }

      // 2. Jika role tidak diizinkan membuka dashboard (misal: Guru) -> lempar ke laporan.html
      if (msg && msg.includes("tidak diizinkan menjalankan action")) {
        if (typeof Auth !== "undefined" && typeof Auth.getUser === "function") {
          const user = Auth.getUser();
          if (user && user.role === "guru") {
            window.location.replace("laporan.html");
            return;
          }
        }
      }

      throw new Error(msg);
    }
  } catch (err) {
    console.error("Gagal memuat statistik dashboard:", err);

    // Reset nilai elemen DOM ke fallback 0
    if (elTotalSiswa) elTotalSiswa.textContent = "0";
    if (elPelanggaran) elPelanggaran.textContent = "0";
    if (elPrestasi) elPrestasi.textContent = "0";
    if (elTotalCatatan) elTotalCatatan.textContent = "0";

    // Tampilkan pesan error di antarmuka jika elemen penampung error tersedia
    if (errorEl) {
      errorEl.textContent = err.message || "Gagal memuat data statistik.";
      errorEl.classList.remove("hidden");
    }
  }
}
