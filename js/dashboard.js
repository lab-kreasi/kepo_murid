/**
 * Dashboard Logic (index.html)
 */
document.addEventListener("DOMContentLoaded", () => {
  // Pengecekan autentikasi (mendukung Auth.protectPage atau Auth.checkAuth)
  if (typeof Auth !== "undefined") {
    if (typeof Auth.protectPage === "function") Auth.protectPage();
    else if (typeof Auth.checkAuth === "function") Auth.checkAuth();
  }
  initDashboard();
});

async function initDashboard() {
  const tahun = (typeof CONFIG !== "undefined" && CONFIG.DEFAULT_TAHUN_AJARAN) ? CONFIG.DEFAULT_TAHUN_AJARAN : "";

  try {
    // 1. Ambil Data Widget Counter Dashboard
    let dashboardRes;
    if (typeof ApiService !== "undefined" && ApiService.getDashboardData) {
      dashboardRes = await ApiService.getDashboardData(tahun);
    } else if (typeof API !== "undefined" && API.get) {
      dashboardRes = await API.get("getDashboardData", { tahun: tahun });
    }

    if (dashboardRes && dashboardRes.status === "success") {
      const data = dashboardRes.data;

      // Update Ringkasan Catatan Hari Ini & Siswa
      setElementText(["dash-total-siswa", "widget-total-siswa"], data.total_siswa || 0);
      setElementText(["dash-pelanggaran-hari-ini", "widget-pelanggaran-today"], data.pelanggaran_hari_ini || 0);
      setElementText(["dash-prestasi-hari-ini"], data.prestasi_hari_ini || 0);
      setElementText(["dash-total-catatan"], data.total_catatan || 0);

      // Update Rincian Akumulasi Poin
      setElementText(["dash-poin-pelanggaran"], data.total_poin_pelanggaran || 0);
      setElementText(["dash-poin-prestasi"], data.total_poin_prestasi || 0);
      setElementText(["dash-total-poin", "widget-total-poin"], data.total_poin_kumulatif || 0);
    }

    // 2. Ambil Top 5 Siswa dengan Poin Paling Tinggi
    let rankingRes;
    if (typeof ApiService !== "undefined" && ApiService.getRankingSiswa) {
      rankingRes = await ApiService.getRankingSiswa(tahun, 5);
    } else if (typeof API !== "undefined" && API.get) {
      rankingRes = await API.get("getRankingSiswa", { tahun: tahun, limit: 5 });
    }

    if (rankingRes && rankingRes.status === "success") {
      renderTopRankingTable(rankingRes.data);
    }
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err);
  }
}

// Helper untuk mengisi text elemen HTML (dukungan untuk ID baru maupun ID lama)
function setElementText(elementIds, value) {
  elementIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  });
}

// Render Tabel Top Ranking Siswa
function renderTopRankingTable(rankingList) {
  const tableBody = document.getElementById("table-top-ranking");
  if (!tableBody) return;

  if (!rankingList || rankingList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">Belum ada catatan pelanggaran atau prestasi.</td></tr>`;
    return;
  }

  tableBody.innerHTML = rankingList.map((item, index) => {
    const totalPoin = item.total_poin || 0;
    const badgeClass = totalPoin > 0 ? "bg-danger" : (totalPoin < 0 ? "bg-success" : "bg-secondary");

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nis}</td>
        <td><strong>${item.nama}</strong></td>
        <td>${item.kelas}</td>
        <td>
          <span class="text-danger fw-semibold">+${item.poin_pelanggaran || 0}</span> / 
          <span class="text-success fw-semibold">-${item.poin_prestasi || 0}</span>
        </td>
        <td><span class="badge ${badgeClass}">${totalPoin} Poin</span></td>
      </tr>
    `;
  }).join("");
}
