/**
 * js/input.js
 * Logic Frontend dengan Smart Searchbox Siswa & Dropdown Kelas
 */

let allSiswa = [];
let currentClassSiswa = [];
let selectedSiswa = null;

document.addEventListener("DOMContentLoaded", () => {
  // Set default tanggal hari ini
  const dateInput = document.getElementById("input-tanggal");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  // Load Master Data
  loadMasterSiswa();
  loadMasterPelanggaran();

  // Close Smart Dropdown saat klik di luar container
  document.addEventListener("click", (e) => {
    const container = document.getElementById("siswa-searchbox-container");
    if (container && !container.contains(e.target)) {
      hideSiswaDropdown();
    }
  });
});

/**
 * 1. Memuat Master Siswa dari Server
 */
async function loadMasterSiswa() {
  const searchInput = document.getElementById("input-search-siswa");
  if (searchInput) searchInput.placeholder = "Memuat data siswa...";

  try {
    const res = await API.getSiswa("");
    if (res && res.status === "success") {
      allSiswa = res.data || [];
      populateKelasDropdown();
      onKelasChange(); // Filter awal
    } else {
      if (searchInput) searchInput.placeholder = "Gagal memuat data siswa";
    }
  } catch (err) {
    console.error("Error loadMasterSiswa:", err);
    if (searchInput) searchInput.placeholder = "Gagal terhubung ke server";
  }
}

/**
 * 2. Mengisi Dropdown Kelas secara Dinamis dari Data Siswa
 */
function populateKelasDropdown() {
  const selectKelas = document.getElementById("select-kelas");
  if (!selectKelas) return;

  // Ambil daftar kelas unik
  const meSet = new Set();
  allSiswa.forEach(s => {
    if (s.kelas && String(s.kelas).trim() !== "") {
      meSet.add(String(s.kelas).trim());
    }
  });

  // Urutkan kelas secara alfabetis
  const sortedKelas = Array.from(meSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  selectKelas.innerHTML = `<option value="">-- Semua Kelas (${allSiswa.length} Siswa) --</option>`;
  sortedKelas.forEach(kls => {
    const count = allSiswa.filter(s => String(s.kelas).trim() === kls).length;
    selectKelas.innerHTML += `<option value="${kls}">Kelas ${kls} (${count} Siswa)</option>`;
  });
}

/**
 * 3. Event Handler saat Dropdown Kelas Berubah
 */
function onKelasChange() {
  const selectedKelas = document.getElementById("select-kelas")?.value || "";
  
  if (selectedKelas === "") {
    currentClassSiswa = allSiswa;
  } else {
    currentClassSiswa = allSiswa.filter(s => String(s.kelas).trim() === selectedKelas);
  }

  // Reset Pilihan Siswa saat kelas berganti
  clearSelectedSiswa();
}

/**
 * 4. Logic Smart Searchbox (Autocomplete)
 */
function onSiswaSearchInput(query) {
  const clearBtn = document.getElementById("btn-clear-siswa");
  const hiddenInput = document.getElementById("select-siswa");

  // Reset hidden ID jika user mengubah teks ketikan
  if (hiddenInput) hiddenInput.value = "";
  selectedSiswa = null;

  if (query.trim() !== "") {
    if (clearBtn) clearBtn.classList.remove("hidden");
  } else {
    if (clearBtn) clearBtn.classList.add("hidden");
  }

  renderSiswaDropdownResults(query);
  showSiswaDropdown();
}

function renderSiswaDropdownResults(query = "") {
  const dropdown = document.getElementById("dropdown-siswa-results");
  if (!dropdown) return;

  const q = query.toLowerCase().trim();
  
  // Filter berdasarkan Nama atau NISN
  const filtered = currentClassSiswa.filter(s => 
    (s.nama || "").toLowerCase().includes(q) || 
    (s.nisn || s.nis || "").toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    dropdown.innerHTML = `
      <div class="p-3 text-center text-xs text-slate-400">
        Siswa tidak ditemukan.
      </div>
    `;
    return;
  }

  // Batasi render maksimal 40 items agar tetap cepat
  const displayList = filtered.slice(0, 40);

  dropdown.innerHTML = displayList.map(s => {
    const nisnStr = (s.nisn || s.nis) ? ` | NISN: ${s.nisn || s.nis}` : '';
    const kelasStr = s.kelas ? `Kelas ${s.kelas}` : 'Tanpa Kelas';
    
    return `
      <div onclick="selectSiswa('${s.id}')" 
           class="p-3 hover:bg-red-50 cursor-pointer transition flex items-center justify-between text-sm group">
        <div>
          <p class="font-semibold text-slate-800 group-hover:text-red-600">${s.nama}</p>
          <p class="text-xs text-slate-400">${kelasStr}${nisnStr}</p>
        </div>
        <span class="text-xs px-2 py-0.5 bg-slate-100 group-hover:bg-red-100 group-hover:text-red-600 text-slate-500 rounded font-medium">Pilih</span>
      </div>
    `;
  }).join('');
}

function selectSiswa(siswaId) {
  const siswa = allSiswa.find(s => String(s.id) === String(siswaId));
  if (!siswa) return;

  selectedSiswa = siswa;
  
  // Update Hidden Input & Search Field
  document.getElementById("select-siswa").value = siswa.id;
  
  const searchInput = document.getElementById("input-search-siswa");
  if (searchInput) {
    searchInput.value = `${siswa.nama} (Kelas ${siswa.kelas || '-'})`;
  }

  document.getElementById("btn-clear-siswa")?.classList.remove("hidden");
  hideSiswaDropdown();
}

function clearSelectedSiswa() {
  selectedSiswa = null;
  
  const hiddenInput = document.getElementById("select-siswa");
  const searchInput = document.getElementById("input-search-siswa");
  const clearBtn = document.getElementById("btn-clear-siswa");

  if (hiddenInput) hiddenInput.value = "";
  if (searchInput) {
    searchInput.value = "";
    const selectedKelas = document.getElementById("select-kelas")?.value;
    searchInput.placeholder = selectedKelas 
      ? `Cari nama/NISN di Kelas ${selectedKelas}...` 
      : "Ketik nama atau NISN siswa...";
  }
  if (clearBtn) clearBtn.classList.add("hidden");
  
  hideSiswaDropdown();
}

function showSiswaDropdown() {
  const dropdown = document.getElementById("dropdown-siswa-results");
  if (dropdown && !selectedSiswa) {
    const query = document.getElementById("input-search-siswa")?.value || "";
    renderSiswaDropdownResults(query);
    dropdown.classList.remove("hidden");
  }
}

function hideSiswaDropdown() {
  const dropdown = document.getElementById("dropdown-siswa-results");
  if (dropdown) dropdown.classList.add("hidden");
}

/**
 * 5. Memuat Master Jenis Pelanggaran & Checkbox
 */
async function loadMasterPelanggaran() {
  const container = document.getElementById("container-checkbox-pelanggaran");
  if (!container) return;

  try {
    const res = await API.getJenisPelanggaran("");

    if (res && res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
      container.innerHTML = res.data.map(item => `
        <label class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer transition">
          <div class="flex items-center gap-3">
            <input type="checkbox" name="pelanggaran_ids" value="${item.id}" class="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500">
            <span class="font-medium text-slate-800">${item.jenis || item.nama || '-'}</span>
          </div>
          <span class="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
            +${item.poin || item.bobot || 0} Poin
          </span>
        </label>
      `).join('');
    } else {
      container.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs">Belum ada master data jenis pelanggaran di Spreadsheet.</div>`;
    }
  } catch (err) {
    console.error("Error loadMasterPelanggaran:", err);
    container.innerHTML = `<div class="p-4 text-center text-rose-500 text-xs font-semibold">Gagal memuat daftar pelanggaran dari server.</div>`;
  }
}

/**
 * 6. Submit Form Catatan Pelanggaran
 */
async function submitFullCatatan(event) {
  event.preventDefault();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;

  const tanggal = document.getElementById("input-tanggal").value;
  const siswaId = document.getElementById("select-siswa").value;
  
  const checkedBoxes = document.querySelectorAll('input[name="pelanggaran_ids"]:checked');
  const pelanggaranIds = Array.from(checkedBoxes).map(cb => cb.value);

  if (!siswaId) {
    alert("Silakan cari dan pilih siswa terlebih dahulu dari daftar!");
    document.getElementById("input-search-siswa")?.focus();
    return;
  }

  if (pelanggaranIds.length === 0) {
    alert("Pilih minimal satu jenis pelanggaran!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Menyimpan...";

  try {
    const payload = {
      tanggal,
      siswa_id: siswaId,
      pelanggaran_ids: pelanggaranIds
    };

    const res = await API.addCatatan(payload);

    if (res && res.status === "success") {
      alert(res.message || "Catatan pelanggaran berhasil disimpan!");
      
      // Reset Form & Smart Searchbox
      clearSelectedSiswa();
      document.querySelectorAll('input[name="pelanggaran_ids"]').forEach(cb => cb.checked = false);
    } else {
      alert("Gagal menyimpan: " + (res?.message || "Terjadi kesalahan."));
    }
  } catch (err) {
    console.error("Error submitFullCatatan:", err);
    alert("Terjadi kesalahan koneksi saat menyimpan catatan.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = originalText;
  }
}
