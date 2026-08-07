/**
 * Logic Input & Absen Cepat Pelanggaran (input-pelanggaran.html)
 */
let listSiswaInput = [];
let listPelanggaranInput = [];

document.addEventListener("DOMContentLoaded", async () => {
  Auth.protectPage();
  
  // Set default tanggal hari ini
  const inputTanggal = document.getElementById("input-tanggal");
  if (inputTanggal) {
    inputTanggal.value = new Date().toISOString().split("T")[0];
  }

  // Load master data pendukung
  await Promise.all([loadMasterSiswa(), loadMasterPelanggaran()]);
});

async function loadMasterSiswa() {
  const kelas = document.getElementById("select-kelas")?.value || "";
  const res = await ApiService.getSiswa(CONFIG.DEFAULT_TAHUN_AJARAN, kelas);
  if (res.status === "success") {
    listSiswaInput = res.data;
    renderSiswaOptions();
  }
}

async function loadMasterPelanggaran() {
  const res = await ApiService.getJenisPelanggaran(CONFIG.DEFAULT_TAHUN_AJARAN);
  if (res.status === "success") {
    listPelanggaranInput = res.data;
    renderPelanggaranCheckboxes();
  }
}

function renderSiswaOptions() {
  const selectSiswa = document.getElementById("select-siswa");
  if (!selectSiswa) return;

  selectSiswa.innerHTML = `<option value="">-- Pilih Siswa --</option>` + 
    listSiswaInput.map(s => `<option value="${s.id}">${s.nama} (${s.kelas})</option>`).join("");
}

function renderPelanggaranCheckboxes() {
  const container = document.getElementById("container-checkbox-pelanggaran");
  if (!container) return;

  container.innerHTML = listPelanggaranInput.map(p => `
    <div class="form-check">
      <input class="form-check-input chk-pelanggaran" type="checkbox" value="${p.id}" data-poin="${p.poin}" id="chk-${p.id}">
      <label class="form-check-label" for="chk-${p.id}">
        ${p.jenis} <span class="badge bg-secondary">+${p.poin} Poin</span>
      </label>
    </div>
  `).join("");
}

// Pencatatan Cepat Satu Klik (Satu Jenis Pelanggaran)
async function recordQuickAction(siswaId, pelanggaranId, poin) {
  const payload = {
    siswa_id: siswaId,
    pelanggaran_id: pelanggaranId,
    poin: Number(poin),
    tanggal: document.getElementById("input-tanggal")?.value || new Date().toISOString().split("T")[0],
    tahun_ajaran: CONFIG.DEFAULT_TAHUN_AJARAN
  };

  const res = await ApiService.quickRecord(payload);
  alert(res.message);
}

// Form Catat Lengkap (Multi Pelanggaran)
async function submitFullCatatan(event) {
  event.preventDefault();
  const siswaId = document.getElementById("select-siswa").value;
  const tanggal = document.getElementById("input-tanggal").value;
  
  if (!siswaId) {
    alert("Silakan pilih siswa!");
    return;
  }

  const selectedBoxes = document.querySelectorAll(".chk-pelanggaran:checked");
  if (selectedBoxes.length === 0) {
    alert("Pilih minimal 1 jenis pelanggaran!");
    return;
  }

  let pelanggaranIds = [];
  let totalPoin = 0;

  selectedBoxes.forEach(chk => {
    pelanggaranIds.push(chk.value);
    totalPoin += Number(chk.getAttribute("data-poin") || 0);
  });

  const payload = {
    siswa_id: siswaId,
    tanggal: tanggal,
    pelanggaran_ids: pelanggaranIds,
    total_poin: totalPoin,
    tahun_ajaran: CONFIG.DEFAULT_TAHUN_AJARAN
  };

  const res = await ApiService.addCatatan(payload);
  alert(res.message);

  if (res.status === "success") {
    document.getElementById("form-catat-lengkap")?.reset();
  }
}
