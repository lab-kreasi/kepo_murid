/**
 * js/input.js
 * Logic Frontend untuk Input Catatan Pelanggaran Siswa
 */

let allSiswa = [];
let allPelanggaran = [];

document.addEventListener("DOMContentLoaded", () => {
  // Set default tanggal ke hari ini (YYYY-MM-DD)
  const dateInput = document.getElementById("input-tanggal");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  // Load Data Master saat halaman dibuka
  loadMasterSiswa();
  loadMasterPelanggaran();
});

/**
 * Memuat Master Siswa dari Spreadsheet & mengisi Dropdown
 */
async function loadMasterSiswa() {
  const selectSiswa = document.getElementById("select-siswa");
  const filterKelas = document.getElementById("select-kelas")?.value.trim().toLowerCase() || "";

  if (!selectSiswa) return;

  try {
    // Ambil data siswa dari API jika memori masih kosong
    if (allSiswa.length === 0) {
      const res = await API.getSiswa();
      if (res && res.status === "success") {
        allSiswa = res.data || [];
      } else {
        console.warn("Gagal mendapatkan data siswa:", res?.message);
      }
    }

    // Filter berdasarkan input kelas (jika diisi)
    let filtered = allSiswa;
    if (filterKelas) {
      filtered = allSiswa.filter(s => 
        (s.kelas || s.class || "").toString().toLowerCase().includes(filterKelas)
      );
    }

    // Render ke <select id="select-siswa">
    selectSiswa.innerHTML = `<option value="">-- Pilih Siswa (${filtered.length}) --</option>`;
    
    if (filtered.length === 0) {
      selectSiswa.innerHTML = `<option value="">-- Data siswa tidak ditemukan --</option>`;
      return;
    }

    filtered.forEach(siswa => {
      const option = document.createElement("option");
      option.value = siswa.id;
      const kelasStr = siswa.kelas ? ` - Kelas ${siswa.kelas}` : "";
      const nisnStr = siswa.nisn ? ` (NISN: ${siswa.nisn})` : "";
      option.textContent = `${siswa.nama}${kelasStr}${nisnStr}`;
      selectSiswa.appendChild(option);
    });

  } catch (err) {
    console.error("Error loadMasterSiswa:", err);
    selectSiswa.innerHTML = `<option value="">Gagal terhubung ke server</option>`;
  }
}

/**
 * Memuat Master Jenis Pelanggaran & merender Checkbox
 */
async function loadMasterPelanggaran() {
  const container = document.getElementById("container-checkbox-pelanggaran");
  if (!container) return;

  container.innerHTML = `
    <div class="p-3 text-center text-slate-400 text-xs">
      <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mb-1"></div>
      <p>Memuat daftar jenis pelanggaran...</p>
    </div>
  `;

  try {
    const res = await API.getJenisPelanggaran();

    if (res && res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
      allPelanggaran = res.data;
      
      container.innerHTML = allPelanggaran.map(item => `
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
      container.innerHTML = `
        <div class="p-4 text-center text-slate-400 text-xs">
          Belum ada master data jenis pelanggaran di Spreadsheet.
        </div>
      `;
    }
  } catch (err) {
    console.error("Error loadMasterPelanggaran:", err);
    container.innerHTML = `
      <div class="p-4 text-center text-rose-500 text-xs font-semibold">
        Gagal memuat daftar pelanggaran dari server.
      </div>
    `;
  }
}

/**
 * Handle Simpan Catatan Pelanggaran Siswa
 */
async function submitFullCatatan(event) {
  event.preventDefault();
  
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;

  const tanggal = document.getElementById("input-tanggal").value;
  const siswaId = document.getElementById("select-siswa").value;
  
  // Ambil semua ID pelanggaran yang dicentang
  const checkedBoxes = document.querySelectorAll('input[name="pelanggaran_ids"]:checked');
  const pelanggaranIds = Array.from(checkedBoxes).map(cb => cb.value);

  if (!siswaId) {
    alert("Silakan pilih siswa terlebih dahulu!");
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
      
      // Reset Form & Checkbox
      document.getElementById("form-catat-lengkap").reset();
      
      // Reset tanggal ke hari ini
      const dateInput = document.getElementById("input-tanggal");
      if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
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
