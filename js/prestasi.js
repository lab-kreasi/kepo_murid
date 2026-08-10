document.addEventListener("DOMContentLoaded", () => {
  if (typeof Auth !== "undefined") Auth.checkAuth();
  loadMasterPrestasi();
});

// Memuat daftar jenis prestasi dari backend
async function loadMasterPrestasi() {
  const tbody = document.getElementById("tbody-prestasi");
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Memuat data...</td></tr>';

  try {
    const res = await API.get("getJenisPrestasi");
    if (res.status === "success") {
      renderTablePrestasi(res.data);
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-danger">${res.message}</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-danger">Gagal memuat data master prestasi.</td></tr>';
  }
}

// Mengisi baris tabel master jenis prestasi
function renderTablePrestasi(data) {
  const tbody = document.getElementById("tbody-prestasi");
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Belum ada data jenis prestasi.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="fw-semibold text-dark">${item.jenis}</td>
      <td><span class="badge bg-success">+${item.poin} Poin</span></td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="handleDeletePrestasi('${item.id}')">
          Hapus
        </button>
      </td>
    </tr>
  `).join('');
}

// Form submit handler: Menambah jenis prestasi baru
async function handleSavePrestasi(e) {
  e.preventDefault();
  const jenisInput = document.getElementById("prestasi-jenis");
  const poinInput = document.getElementById("prestasi-poin");

  const payload = {
    jenis: jenisInput.value.trim(),
    poin: Number(poinInput.value)
  };

  try {
    const res = await API.post("addJenisPrestasi", payload);
    if (res.status === "success") {
      alert("Jenis prestasi berhasil ditambahkan!");
      jenisInput.value = "";
      poinInput.value = "";
      loadMasterPrestasi();
    } else {
      alert(res.message || "Gagal menyimpan data.");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan jaringan atau sistem.");
  }
}

// Menghapus jenis prestasi
async function handleDeletePrestasi(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus jenis prestasi ini?")) return;

  try {
    const res = await API.post("deleteJenisPrestasi", { id: id });
    if (res.status === "success") {
      alert("Data berhasil dihapus!");
      loadMasterPrestasi();
    } else {
      alert(res.message || "Gagal menghapus data.");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan sistem saat menghapus.");
  }
}
