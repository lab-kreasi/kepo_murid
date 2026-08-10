document.addEventListener("DOMContentLoaded", () => {
  if (typeof Auth !== "undefined") Auth.checkAuth();

  // Set tanggal default ke hari ini
  const inputTanggal = document.getElementById("input-tanggal-prestasi");
  if (inputTanggal) {
    inputTanggal.value = new Date().toISOString().split("T")[0];
  }

  loadSiswaPrestasi();
  loadMasterPrestasiCheckboxes();
});

// Memuat data siswa berdasarkan pencarian/filter kelas
async function loadSiswaPrestasi() {
  const kelasInput = document.getElementById("select-kelas-prestasi");
  const selectSiswa = document.getElementById("select-siswa-prestasi");
  if (!selectSiswa) return;

  const kelasFilter = kelasInput ? kelasInput.value.trim() : "";

  try {
    const res = await API.get("getSiswa", { kelas: kelasFilter });
    if (res.status === "success") {
      selectSiswa.innerHTML = '<option value="">-- Pilih Siswa --</option>';
      res.data.forEach(s => {
        selectSiswa.innerHTML += `<option value="${s.id}">${s.nis} - ${s.nama} (${s.kelas})</option>`;
      });
    }
  } catch (err) {
    console.error("Gagal memuat data siswa:", err);
  }
}

// Memuat daftar jenis prestasi sebagai checkbox
async function loadMasterPrestasiCheckboxes() {
  const container = document.getElementById("container-checkbox-prestasi");
  if (!container) return;

  container.innerHTML = '<div class="text-muted small">Memuat daftar prestasi...</div>';

  try {
    const res = await API.get("getJenisPrestasi");
    if (res.status === "success" && res.data.length > 0) {
      container.innerHTML = res.data.map(item => `
        <div class="form-check mb-2">
          <input class="form-check-input checkbox-prestasi-item" type="checkbox" value="${item.id}" data-poin="${item.poin}" id="prestasi-${item.id}">
          <label class="form-check-label small" for="prestasi-${item.id}">
            <span class="fw-semibold text-dark">${item.jenis}</span> 
            <span class="badge bg-success ms-1">+${item.poin} Poin</span>
          </label>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="text-muted small">Belum ada master jenis prestasi. Buat terlebih dahulu di menu Jenis Prestasi.</div>';
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="text-danger small">Gagal memuat daftar prestasi.</div>';
  }
}

// Form submit handler: Menyimpan catatan prestasi
async function submitCatatanPrestasi(e) {
  e.preventDefault();

  const tanggal = document.getElementById("input-tanggal-prestasi").value;
  const siswaId = document.getElementById("select-siswa-prestasi").value;
  const checkedBoxes = document.querySelectorAll(".checkbox-prestasi-item:checked");

  if (!siswaId) {
    alert("Silakan pilih siswa terlebih dahulu.");
    return;
  }

  if (checkedBoxes.length === 0) {
    alert("Pilih minimal satu jenis prestasi.");
    return;
  }

  const prestasiIds = [];
  let totalPoin = 0;

  checkedBoxes.forEach(cb => {
    prestasiIds.push(cb.value);
    totalPoin += Number(cb.dataset.poin || 0);
  });

  const payload = {
    tanggal: tanggal,
    siswa_id: siswaId,
    prestasi_ids: prestasiIds,
    total_poin: totalPoin
  };

  const btnSubmit = e.target.querySelector('button[type="submit"]');

  try {
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = "Menyimpan...";
    }

    const res = await API.post("addCatatanPrestasi", payload);

    if (res.status === "success") {
      alert("Catatan prestasi berhasil disimpan!");
      e.target.reset();
      
      // Reset tanggal kembali ke hari ini
      document.getElementById("input-tanggal-prestasi").value = new Date().toISOString().split("T")[0];
      loadSiswaPrestasi();
    } else {
      alert(res.message || "Gagal menyimpan catatan.");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan sistem saat menyimpan catatan.");
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Simpan Catatan Prestasi";
    }
  }
}
