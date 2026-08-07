/**
 * Dashboard Logic (index.html)
 */
document.addEventListener("DOMContentLoaded", () => {
  Auth.protectPage();
  initDashboard();
});

async function initDashboard() {
  const tahun = CONFIG.DEFAULT_TAHUN_AJARAN;

  // 1. Ambil Data Widget Counter
  const dashboardRes = await ApiService.getDashboardData(tahun);
  if (dashboardRes.status === "success") {
    const data = dashboardRes.data;
    if (document.getElementById("widget-total-siswa")) {
      document.getElementById("widget-total-siswa").innerText = data.total_siswa || 0;
    }
    if (document.getElementById("widget-pelanggaran-today")) {
      document.getElementById("widget-pelanggaran-today").innerText = data.pelanggaran_hari_ini || 0;
    }
    if (document.getElementById("widget-total-poin")) {
      document.getElementById("widget-total-poin").innerText = data.total_poin_kumulatif || 0;
    }
  }

  // 2. Ambil Top 5 Siswa dengan Poin Pelanggaran Terbanyak
  const rankingRes = await ApiService.getRankingSiswa(tahun, 5);
  if (rankingRes.status === "success") {
    renderTopRankingTable(rankingRes.data);
  }
}

function renderTopRankingTable(rankingList) {
  const tableBody = document.getElementById("table-top-ranking");
  if (!tableBody) return;

  if (rankingList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada catatan pelanggaran.</td></tr>`;
    return;
  }

  tableBody.innerHTML = rankingList.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.nis}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.kelas}</td>
      <td><span class="badge bg-danger">${item.total_poin} Poin</span></td>
    </tr>
  `).join("");
}
