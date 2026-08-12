(() => {
  function init() {
    if (typeof Auth !== "undefined" && typeof Auth.checkAccess === "function") {
      Auth.checkAccess();
    }
    loadDashboardData();
  }

  async function loadDashboardData() {
    const elements = {
      totalSiswa: document.getElementById("dash-total-siswa"),
      pelanggaran: document.getElementById("dash-pelanggaran-tahun-ini"),
      prestasi: document.getElementById("dash-prestasi-tahun-ini"),
      totalCatatan: document.getElementById("dash-total-catatan"),
      error: document.getElementById("dashboard-error")
    };

    const loadingText = "...";
    if (elements.totalSiswa) elements.totalSiswa.textContent = loadingText;
    if (elements.pelanggaran) elements.pelanggaran.textContent = loadingText;
    if (elements.prestasi) elements.prestasi.textContent = loadingText;
    if (elements.totalCatatan) elements.totalCatatan.textContent = loadingText;

    try {
      const api = window.API || window.Api || window.ApiService;
      if (!api || typeof api.getDashboardData !== "function") {
        throw new Error("Modul API tidak ditemukan atau fungsi getDashboardData tidak tersedia.");
      }

      const res = await api.getDashboardData();

      if (res && res.status === "success" && res.data) {
        const data = res.data;

        if (elements.totalSiswa) elements.totalSiswa.textContent = Number(data.total_siswa || 0).toLocaleString('id-ID');
        if (elements.pelanggaran) elements.pelanggaran.textContent = Number(data.total_pelanggaran || 0).toLocaleString('id-ID');
        if (elements.prestasi) elements.prestasi.textContent = Number(data.total_prestasi || 0).toLocaleString('id-ID');
        if (elements.totalCatatan) elements.totalCatatan.textContent = Number(data.total_catatan || 0).toLocaleString('id-ID');

        if (elements.error) {
          elements.error.classList.add("hidden");
          elements.error.textContent = "";
        }
      } else {
        handleDashboardError(res);
      }
    } catch (err) {
      console.error("Gagal memuat statistik dashboard:", err);
      showErrorState(elements, err.message);
    }
  }

  function handleDashboardError(res) {
    const msg = res && res.message ? res.message : "Gagal memuat data dashboard";
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes("server-side tidak valid") || lowerMsg.includes("sesi telah berakhir")) {
      if (typeof Auth !== "undefined" && typeof Auth.logout === "function") {
        alert("Sesi login Anda telah berakhir. Silakan login kembali.");
        Auth.logout();
        return; 
      }
    }

    if (lowerMsg.includes("tidak diizinkan menjalankan action")) {
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

  function showErrorState(elements, errorMessage) {
    if (elements.totalSiswa) elements.totalSiswa.textContent = "0";
    if (elements.pelanggaran) elements.pelanggaran.textContent = "0";
    if (elements.prestasi) elements.prestasi.textContent = "0";
    if (elements.totalCatatan) elements.totalCatatan.textContent = "0";

    if (elements.error) {
      elements.error.textContent = errorMessage || "Gagal memuat data statistik.";
      elements.error.classList.remove("hidden");
    }
  }

  window.loadDashboardData = loadDashboardData;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();