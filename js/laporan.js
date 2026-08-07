/**
 * Logic Laporan & Ranking (laporan.html)
 */
let reportRankingData = [];

document.addEventListener("DOMContentLoaded", () => {
  Auth.protectPage();
  loadLaporanRanking();
});

async function loadLaporanRanking() {
  const limit = document.getElementById("filter-limit")?.value || "";
  const res = await ApiService.getRankingSiswa(CONFIG.DEFAULT_TAHUN_AJARAN, limit);

  if (res.status === "success") {
    reportRankingData = res.data;
    renderLaporanTable(reportRankingData);
  } else {
    alert(res.message);
  }
}

function renderLaporanTable(data) {
  const tbody = document.getElementById("tbody-laporan");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada data pelanggaran untuk dilaporkan.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.nis}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.kelas}</td>
      <td>${item.frekuensi} Kali</td>
      <td><span class="badge bg-danger">${item.total_poin} Poin</span></td>
    </tr>
  `).join("");
}

// Fungsi Cetak Laporan (Print PDF via Browser)
function printLaporan() {
  window.print();
}

// Fungsi Export ke CSV
function exportToCSV() {
  if (reportRankingData.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Peringkat,NIS,Nama Siswa,Kelas,Frekuensi,Total Poin\n";

  reportRankingData.forEach((row, index) => {
    csvContent += `${index + 1},"${row.nis}","${row.nama}","${row.kelas}",${row.frekuensi},${row.total_poin}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Laporan_Pelanggaran_${CONFIG.DEFAULT_TAHUN_AJARAN}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
