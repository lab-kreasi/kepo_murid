(() => {
  let rawLaporanData = [];

  function init() {
    loadLaporanRanking();
  }

  async function loadLaporanRanking() {
    const tbody = document.getElementById("tbody-laporan");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-8 text-center text-slate-400 text-sm">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p>Memuat rekapitulasi data laporan...</p>
          </td>
        </tr>
      `;
    }

    try {
      const resRanking = await API.getRankingSiswa("");
      
      if (resRanking && resRanking.status === "success" && Array.isArray(resRanking.data) && resRanking.data.length > 0) {
        rawLaporanData = processLaporanData(resRanking.data);
      } else {
        const [resSiswa, resCatatan] = await Promise.all([
          API.getSiswa(""),
          API.getCatatan("")
        ]);

        if (resSiswa && resSiswa.status === "success") {
          const siswaList = resSiswa.data || [];
          const catatanList = (resCatatan && resCatatan.status === "success") ? (resCatatan.data || []) : [];
          rawLaporanData = calculateLaporanFromClient(siswaList, catatanList);
        } else {
          rawLaporanData = [];
        }
      }

      populateKelasFilterOptions();
      renderLaporanTable();

    } catch (err) {
      console.error("Error loadLaporanRanking:", err);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="py-8 text-center text-rose-500 text-sm font-medium">
              Gagal terhubung ke server untuk memuat laporan.
            </td>
          </tr>
        `;
      }
    }
  }

  function processLaporanData(dataArr) {
    return dataArr.map(item => {
      const poinPelanggaran = Number(item.total_pelanggaran || item.poin_pelanggaran || item.poin || 0);
      const poinPrestasi = Number(item.total_prestasi || item.poin_prestasi || 0);
      const freqPelanggaran = Number(item.frekuensi_pelanggaran || item.freq_pelanggaran || item.jumlah_pelanggaran || 0);
      const freqPrestasi = Number(item.frekuensi_prestasi || item.freq_prestasi || item.jumlah_prestasi || 0);
      const akumulasi = poinPelanggaran - poinPrestasi;

      return {
        nis: item.nisn || item.nis || "-",
        nama: item.nama || item.nama_siswa || "-",
        kelas: item.kelas || "-",
        freq_pelanggaran: freqPelanggaran,
        poin_pelanggaran: poinPelanggaran,
        freq_prestasi: freqPrestasi,
        poin_prestasi: poinPrestasi,
        akumulasi_poin: akumulasi
      };
    });
  }

  function calculateLaporanFromClient(siswaList, catatanList) {
    const mapSiswa = {};

    siswaList.forEach(s => {
      mapSiswa[s.id] = {
        nis: s.nisn || s.nis || "-",
        nama: s.nama || "-",
        kelas: s.kelas || "-",
        freq_pelanggaran: 0,
        poin_pelanggaran: 0,
        freq_prestasi: 0,
        poin_prestasi: 0,
        akumulasi_poin: 0
      };
    });

    catatanList.forEach(c => {
      const sId = c.siswa_id;
      if (mapSiswa[sId]) {
        const isPrestasi = String(c.tipe || "").toLowerCase() === "prestasi" || (c.poin_prestasi && Number(c.poin_prestasi) > 0);
        const poin = Number(c.poin || c.bobot || 0);

        if (isPrestasi) {
          mapSiswa[sId].freq_prestasi += 1;
          mapSiswa[sId].poin_prestasi += poin;
        } else {
          mapSiswa[sId].freq_pelanggaran += 1;
          mapSiswa[sId].poin_pelanggaran += poin;
        }
      }
    });

    return Object.values(mapSiswa).map(item => {
      item.akumulasi_poin = item.poin_pelanggaran - item.poin_prestasi;
      return item;
    });
  }

  function populateKelasFilterOptions() {
    const selectKelas = document.getElementById("filter-kelas-laporan");
    if (!selectKelas) return;

    const kelasSet = new Set();
    rawLaporanData.forEach(d => {
      if (d.kelas && String(d.kelas).trim() !== "" && d.kelas !== "-") {
        kelasSet.add(String(d.kelas).trim());
      }
    });

    const sortedKelas = Array.from(kelasSet).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    selectKelas.innerHTML = `<option value="">Semua Kelas</option>`;
    sortedKelas.forEach(kls => {
      selectKelas.innerHTML += `<option value="${kls}">Kelas ${kls}</option>`;
    });
  }

  function renderLaporanTable() {
    const tbody = document.getElementById("tbody-laporan");
    const selectedKelas = document.getElementById("filter-kelas-laporan")?.value || "";
    const limitVal = document.getElementById("filter-limit")?.value || "";

    if (!tbody) return;

    let filtered = rawLaporanData.filter(item => {
      if (selectedKelas && String(item.kelas).trim() !== selectedKelas) return false;
      return true;
    });

    filtered.sort((a, b) => b.akumulasi_poin - a.akumulasi_poin);

    if (limitVal !== "") {
      const limitNum = parseInt(limitVal, 10);
      if (!isNaN(limitNum)) filtered = filtered.slice(0, limitNum);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-8 text-center text-slate-400 text-sm">
            Tidak ada data laporan yang sesuai dengan filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((item, index) => {
      const rank = index + 1;
      
      let rankBadge = `<span class="font-bold text-slate-600">${rank}</span>`;
      if (rank === 1) rankBadge = `<span class="px-2 py-1 bg-amber-100 text-amber-700 font-bold rounded-lg text-xs">🥇 1</span>`;
      else if (rank === 2) rankBadge = `<span class="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">🥈 2</span>`;
      else if (rank === 3) rankBadge = `<span class="px-2 py-1 bg-amber-800/10 text-amber-800 font-bold rounded-lg text-xs">🥉 3</span>`;

      let akumulasiBadge = `<span class="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">0</span>`;
      if (item.akumulasi_poin > 0) {
        akumulasiBadge = `<span class="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full text-xs">+${item.akumulasi_poin}</span>`;
      } else if (item.akumulasi_poin < 0) {
        akumulasiBadge = `<span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-xs">${item.akumulasi_poin}</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-4 text-center font-semibold">${rankBadge}</td>
          <td class="py-3 px-4 text-slate-500 font-mono text-xs">${item.nis}</td>
          <td class="py-3 px-4 font-semibold text-slate-800">${item.nama}</td>
          <td class="py-3 px-4 text-center">${item.kelas}</td>
          <td class="py-3 px-4 text-center font-medium text-slate-600">${item.freq_pelanggaran}x</td>
          <td class="py-3 px-4 text-center font-bold text-red-600">${item.poin_pelanggaran}</td>
          <td class="py-3 px-4 text-center font-medium text-slate-600">${item.freq_prestasi}x</td>
          <td class="py-3 px-4 text-center font-bold text-emerald-600">${item.poin_prestasi}</td>
          <td class="py-3 px-4 text-center">${akumulasiBadge}</td>
        </tr>
      `;
    }).join('');
  }

  function exportToCSV() {
    if (!rawLaporanData || rawLaporanData.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const selectedKelas = document.getElementById("filter-kelas-laporan")?.value || "";
    let dataToExport = [...rawLaporanData];

    if (selectedKelas) {
      dataToExport = dataToExport.filter(item => String(item.kelas).trim() === selectedKelas);
    }

    dataToExport.sort((a, b) => b.akumulasi_poin - a.akumulasi_poin);

    const headers = [
      "PERINGKAT",
      "NIS",
      "NAMA SISWA",
      "KELAS",
      "FREKUENSI PELANGGARAN",
      "TOTAL POIN PELANGGARAN",
      "FREKUENSI PRESTASI",
      "TOTAL POIN PRESTASI",
      "AKUMULASI POIN"
    ];

    const rows = dataToExport.map((item, index) => [
      index + 1,
      `"${item.nis}"`,
      `"${item.nama.replace(/"/g, '""')}"`,
      `"${item.kelas}"`,
      item.freq_pelanggaran,
      item.poin_pelanggaran,
      item.freq_prestasi,
      item.poin_prestasi,
      item.akumulasi_poin
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Akumulasi_Poin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printLaporan() {
    window.print();
  }

  window.loadLaporanRanking = loadLaporanRanking;
  window.renderLaporanTable = renderLaporanTable;
  window.exportToCSV = exportToCSV;
  window.printLaporan = printLaporan;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();