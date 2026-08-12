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
  // 1. Kumpulkan elemen DOM ke dalam satu objek agar lebih rapi
  const elements = {
    totalSiswa: document.getElementById("dash-total-siswa"),
    pelanggaran: document.getElementById("dash-pelanggaran-tahun-ini"),
    prestasi: document.getElementById("dash-prestasi-tahun-ini"),
    totalCatatan: document.getElementById("dash-total-catatan"),
    error: document.getElementById("dashboard-error")
  };

  // 2. Set UI ke status 'Loading' sambil menunggu respon API
  const loadingText = "...";
  if (elements.totalSiswa) elements.totalSiswa.textContent = loadingText;
  if (elements.pelanggaran) elements.pelanggaran.textContent = loadingText;
  if (elements.prestasi) elements.prestasi.textContent = loadingText;
  if (elements.totalCatatan) elements.totalCatatan.textContent = loadingText;

  try {
    // Pengamanan pemanggilan instance API
    const api = window.API || window.Api || window.ApiService;
    if (!api || typeof api.getDashboardData !== "function") {
      throw new Error("Modul API tidak ditemukan atau fungsi getDashboardData tidak tersedia.");
    }

    // Panggil API
    const res = await api.getDashboardData();

    if (res && res.status === "success" && res.data) {
      const data = res.data;

      // Render nilai ke DOM dengan proteksi fallback nilai 0 dan format lokal
      if (elements.totalSiswa) elements.totalSiswa.textContent = Number(data.total_siswa || 0).toLocaleString('id-ID');
      if (elements.pelanggaran) elements.pelanggaran.textContent = Number(data.total_pelanggaran || 0).toLocaleString('id-ID');
      if (elements.prestasi) elements.prestasi.textContent = Number(data.total_prestasi || 0).toLocaleString('id-ID');
      if (elements.totalCatatan) elements.totalCatatan.textContent = Number(data.total_catatan || 0).toLocaleString('id-ID');

      // Sembunyikan dan bersihkan elemen error jika berhasil
      if (elements.error) {
        elements.error.classList.add("hidden");
        elements.error.textContent = "";
      }
    } else {
      // Lempar ke fungsi error handler terpisah jika gagal
      handleDashboardError(res);
    }
  } catch (err) {
    console.error("Gagal memuat statistik dashboard:", err);
    // Tampilkan state error di UI
    showErrorState(elements, err.message);
  }
}

/**
 * Fungsi khusus untuk menangani spesifikasi pesan error dan routing
 */
function handleDashboardError(res) {
  const msg = res && res.message ? res.message : "Gagal memuat data dashboard";
  const lowerMsg = msg.toLowerCase(); // Buat jadi lowercase agar pengecekan lebih kebal

  // 1. Jika sesi server-side expired / tidak valid -> logout aman
  if (lowerMsg.includes("server-side tidak valid") || lowerMsg.includes("sesi telah berakhir")) {
    if (typeof Auth !== "undefined" && typeof Auth.logout === "function") {
      alert("Sesi login Anda telah berakhir. Silakan login kembali.");
      Auth.logout();
      return; 
    }
  }

  // 2. Jika role tidak diizinkan membuka dashboard (misal: Guru) -> lempar ke laporan.html
  if (lowerMsg.includes("tidak diizinkan menjalankan action")) {
    if (typeof Auth !== "undefined" && typeof Auth.getUser === "function") {
      const user = Auth.getUser();
      if (user && user.role === "guru") {
        window.location.replace("laporan.html");
        return;
      }
    }
  }

  // Jika error tidak masuk kondisi di atas, lempar sebagai error biasa ke catch block
  throw new Error(msg);
}

/**
 * Fungsi khusus untuk mereset dan menampilkan pesan UI saat error
 */
function showErrorState(elements, errorMessage) {
  // Reset nilai elemen DOM ke fallback 0
  if (elements.totalSiswa) elements.totalSiswa.textContent = "0";
  if (elements.pelanggaran) elements.pelanggaran.textContent = "0";
  if (elements.prestasi) elements.prestasi.textContent = "0";
  if (elements.totalCatatan) elements.totalCatatan.textContent = "0";

  // Tampilkan pesan error di antarmuka jika elemen penampung tersedia
  if (elements.error) {
    elements.error.textContent = errorMessage || "Gagal memuat data statistik.";
    elements.error.classList.remove("hidden");
  }
}
