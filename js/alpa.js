/**
 * js/alpa.js
 * Modul Pengambilan Data Siswa dari Spreadsheet & Pencatatan Presensi Alpa
 */

(function initAlpaModule() {
  let listSiswa = [];

  // Elemen DOM
  const dateInput = document.getElementById("input-tanggal-alpa");
  const kelasSelect = document.getElementById("select-kelas-alpa");
  const tableBody = document.getElementById("table-siswa-alpa");
  const checkAll = document.getElementById("check-all-alpa");
  const btnSimpan = document.getElementById("btn-simpan-alpa");

  // Helper Sanitasi Nilai Kelas (Konversi Ke String & Trim Spasi)
  function getKelas(siswa) {
    if (!siswa) return "";
    const val = siswa.kelas ?? siswa.Kelas ?? siswa.KELAS ?? siswa.nama_kelas ?? "";
    return String(val).trim();
  }

  // Helper Sanitasi Nama & NISN
  function getNisn(siswa) {
    return String(siswa.nisn ?? siswa.NISN ?? siswa.nis ?? siswa.NIS ?? "-").trim();
  }

  function getNama(siswa) {
    return String(siswa.nama_siswa ?? siswa.nama ?? siswa.Nama ?? "-").trim();
  }

  // Helper Normalisasi Format Respon Spreadsheet
  function normalizeSiswaData(raw) {
    if (!raw) return [];

    // Jika respon terbungkus objek (seperti { data: [...] }, { result: [...] }, dll)
    if (!Array.isArray(raw) && typeof raw === "object") {
      raw = raw.data || raw.result || raw.siswa || raw.payload || [];
    }

    if (!Array.isArray(raw)) return [];

    // Jika respon berupa 2D Array (Baris 1 = Header, Baris 2..N = Data)
    if (raw.length > 0 && Array.isArray(raw[0])) {
      const headers = raw[0].map((h) => String(h).toLowerCase().trim());
      return raw.slice(1).map((row) => {
        let obj = {};
        headers.forEach((h, index) => {
          obj[h] = row[index] !== undefined ? row[index] : "";
        });
        return obj;
      });
    }

    return raw;
  }

  // 1. Set default tanggal ke hari ini
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  // 2. Fungsi Mengambil Data Siswa dari Google Spreadsheet
  async function fetchSiswa() {
    if (!tableBody) return;

    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-6 text-slate-400">
          <div class="flex justify-center items-center gap-2">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Memuat data siswa dari spreadsheet...</span>
          </div>
        </td>
      </tr>`;

    try {
      let responseData = null;

      if (typeof API !== "undefined" && typeof API.getSiswa === "function") {
        responseData = await API.getSiswa();
      } else if (typeof Auth !== "undefined" && typeof Auth.fetchApi === "function") {
        responseData = await Auth.fetchApi("getSiswa");
      } else if (window.API_URL) {
        const response = await fetch(`${window.API_URL}?action=getSiswa`);
        responseData = await response.json();
      } else {
        const localData = localStorage.getItem("kepo_siswa");
        if (localData) responseData = JSON.parse(localData);
      }

      listSiswa = normalizeSiswaData(responseData);
      
      populateKelasOptions(listSiswa);
      renderTable(listSiswa);

    } catch (error) {
      console.error("Gagal mengambil data siswa:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-6 text-red-500 font-medium">
            Gagal memuat data dari Spreadsheet. Pastikan koneksi / API URL sudah benar.
          </td>
        </tr>`;
    }
  }

  // 3. Isi Opsi Dropdown Filter Kelas secara Otomatis
  function populateKelasOptions(data) {
    if (!kelasSelect) return;

    const daftarKelas = [...new Set(data.map((item) => getKelas(item)).filter(Boolean))].sort();
    
    kelasSelect.innerHTML = `<option value="">-- Semua Kelas --</option>`;
    daftarKelas.forEach((kelas) => {
      const opt = document.createElement("option");
      opt.value = kelas;
      opt.textContent = kelas;
      kelasSelect.appendChild(opt);
    });
  }

  // 4. Render Baris Data Siswa ke Tabel
  function renderTable(data) {
    if (!tableBody) return;

    if (!data || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400">Tidak ada data siswa ditemukan.</td></tr>`;
      return;
    }

    tableBody.innerHTML = data.map((siswa) => {
      const nisn = getNisn(siswa);
      const nama = getNama(siswa);
      const kelas = getKelas(siswa) || "-";

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 text-center">
            <input type="checkbox" class="check-siswa-alpa w-4 h-4 text-blue-600 rounded cursor-pointer" 
                   data-nisn="${nisn}" data-nama="${nama}" data-kelas="${kelas}">
          </td>
          <td class="p-3 font-mono text-xs text-slate-600">${nisn}</td>
          <td class="p-3 font-medium text-slate-800">${nama}</td>
          <td class="p-3 text-slate-600">
            <span class="px-2.5 py-1 text-xs rounded-lg bg-slate-100 font-semibold">${kelas}</span>
          </td>
        </tr>
      `;
    }).join("");

    if (checkAll) checkAll.checked = false;
  }

  // 5. Event Filter Berdasarkan Kelas
  if (kelasSelect) {
    kelasSelect.addEventListener("change", (e) => {
      const selectedKelas = String(e.target.value).trim();
      if (!selectedKelas) {
        renderTable(listSiswa);
      } else {
        const filtered = listSiswa.filter((s) => getKelas(s) === selectedKelas);
        renderTable(filtered);
      }
    });
  }

  // 6. Event Checkbox Select All (Hanya berlaku untuk baris yang tampil di tabel)
  if (checkAll) {
    checkAll.addEventListener("change", (e) => {
      const checkboxes = tableBody.querySelectorAll(".check-siswa-alpa");
      checkboxes.forEach((cb) => (cb.checked = e.target.checked));
    });
  }

  // 7. Event Simpan Pelanggaran Alpa ke Spreadsheet
  if (btnSimpan) {
    btnSimpan.addEventListener("click", async () => {
      const selectedCheckboxes = tableBody.querySelectorAll(".check-siswa-alpa:checked");
      const tanggal = dateInput ? dateInput.value : "";

      if (!tanggal) {
        alert("Silakan pilih tanggal presensi terlebih dahulu.");
        return;
      }

      if (selectedCheckboxes.length === 0) {
        alert("Pilih minimal 1 siswa yang Alpa.");
        return;
      }

      const selectedSiswa = Array.from(selectedCheckboxes).map((cb) => ({
        nisn: cb.dataset.nisn,
        nama: cb.dataset.nama,
        kelas: cb.dataset.kelas
      }));

      if (!confirm(`Simpan presensi Alpa untuk ${selectedSiswa.length} siswa pada tanggal ${tanggal}?`)) {
        return;
      }

      const originalBtnText = btnSimpan.innerHTML;
      btnSimpan.disabled = true;
      btnSimpan.innerHTML = `<span>Menyimpan...</span>`;

      try {
        const payload = {
          action: "simpanAlpa",
          tanggal: tanggal,
          jenis_pelanggaran: "Alpa / Tanpa Keterangan",
          poin: 5,
          siswa: selectedSiswa
        };

        if (typeof API !== "undefined" && typeof API.simpanAlpa === "function") {
          await API.simpanAlpa(payload);
        } else if (typeof Auth !== "undefined" && typeof Auth.fetchApi === "function") {
          await Auth.fetchApi("simpanAlpa", payload);
        } else if (window.API_URL) {
          await fetch(window.API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
          });
        }

        alert(`Berhasil menyimpan data Alpa untuk ${selectedSiswa.length} siswa!`);

        selectedCheckboxes.forEach((cb) => (cb.checked = false));
        if (checkAll) checkAll.checked = false;

      } catch (err) {
        console.error("Gagal menyimpan data Alpa:", err);
        alert("Gagal menyimpan data ke Spreadsheet.");
      } finally {
        btnSimpan.disabled = false;
        btnSimpan.innerHTML = originalBtnText;
      }
    });
  }

  fetchSiswa();
})();