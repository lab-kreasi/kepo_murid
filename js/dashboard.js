/**
 * js/dashboard.js
 * Logika pengambilan data dinamis dashboard dari Google Sheets API
 */

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});

async function loadDashboardData() {
  const elTotalSiswa = document.getElementById("dash-total-siswa");
  const elPelanggaranTahun = document.getElementById("dash-pelanggaran-tahun-ini");
  const elPrestasiTahun = document.getElementById("dash-prestasi-tahun-ini");
  const elTotalCatatan = document.getElementById("dash-total-catatan");

  try {
    const res = await API.getDashboardData();

    if (res && res.status === "success" && res.data) {
      const data = res.data;

      if (elTotalSiswa) elTotalSiswa.textContent = data.total_siswa || 0;
      if (elPelanggaranTahun) elPelanggaranTahun.textContent = data.total_catatan_pelanggaran ?? data.pelanggaran_hari_ini ?? 0;
      if (elPrestasiTahun) elPrestasiTahun.textContent = data.total_catatan_prestasi ?? data.prestasi_hari_ini ?? 0;
      if (elTotalCatatan) elTotalCatatan.textContent = data.total_catatan || 0;
    }
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err);
  }
}
