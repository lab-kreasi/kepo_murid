/**
 * js/dashboard.js
 */

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});

async function loadDashboardData() {
  const elTotalSiswa = document.getElementById("dash-total-siswa");
  const elPelanggaran = document.getElementById("dash-pelanggaran-tahun-ini");
  const elPrestasi = document.getElementById("dash-prestasi-tahun-ini");
  const elTotalCatatan = document.getElementById("dash-total-catatan");

  try {
    // Panggil API getDashboardData
    const res = await API.getDashboardData();

    if (res && res.status === "success" && res.data) {
      const data = res.data;

      // Render nilai ke DOM dengan proteksi fallback nilai 0
      if (elTotalSiswa) elTotalSiswa.textContent = Number(data.total_siswa || 0).toLocaleString('id-ID');
      if (elPelanggaran) elPelanggaran.textContent = Number(data.total_pelanggaran || 0).toLocaleString('id-ID');
      if (elPrestasi) elPrestasi.textContent = Number(data.total_prestasi || 0).toLocaleString('id-ID');
      if (elTotalCatatan) elTotalCatatan.textContent = Number(data.total_catatan || 0).toLocaleString('id-ID');
    } else {
      throw new Error(res.message || "Gagal memuat data");
    }
  } catch (err) {
    console.error("Gagal memuat statistik dashboard:", err);
    if (elTotalSiswa) elTotalSiswa.textContent = "0";
    if (elPelanggaran) elPelanggaran.textContent = "0";
    if (elPrestasi) elPrestasi.textContent = "0";
    if (elTotalCatatan) elTotalCatatan.textContent = "0";
  }
}
