let cachePelanggaranList = [];

document.addEventListener("DOMContentLoaded", () => {
  if (typeof Auth !== "undefined" && typeof Auth.checkAuth === "function") {
    Auth.checkAuth();
  }
  loadJenisPelanggaran();
});

// Memuat data jenis pelanggaran dari Backend
async function loadJenisPelanggaran() {
  const tbody = document.getElementById("tbody-pelanggaran");
  if (!tbody) return;

  const tahun = (typeof CONFIG !== "undefined" && CONFIG.DEFAULT_TAHUN_AJARAN) ? CONFIG.DEFAULT_TAHUN_AJARAN : "";
  tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Memuat data...</td></tr>';

  try {
    let res;
    if (typeof API !== "undefined" && API.get) {
      res = await API.get("getJenisPelanggaran", { tahun: tahun });
    } else if (typeof ApiService !== "undefined" && ApiService.getJenisPelanggaran) {
      res = await ApiService.getJenisPelanggaran(tahun);
    }

    if (res && res.status === "success") {
      cachePelanggaranList = res.data || [];
      renderTablePelanggaran(cachePelanggaranList);
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-danger">${res ? res.message : "Gagal memuat data"}</td></tr>`;
    }
  } catch (err) {
    console.error("Gagal memuat jenis pelanggaran:", err);
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-danger">Koneksi terputus atau terjadi kesalahan.</td></tr>';
  }
}

// Menampilkan data ke tabel
function renderTablePelanggaran(data) {
  const tbody = document.getElementById("tbody-pelanggaran");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Belum ada jenis pelanggaran.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${item.jenis}</strong></td>
      <td><span class="badge bg-danger">${item.poin} Poin</span></td>
      <td>
        <button class="btn btn-sm btn-outline-warning me-1" onclick="editPelanggaran('${item.id}')">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="handleDeletePelanggaran('${item.id}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

// Menambah atau Memperbarui Data Jenis Pelanggaran
async function handleSavePelanggaran(e) {
  e.preventDefault();

  const id = document.getElementById("pelanggaran-id").value;
  const jenis = document.getElementById("pelanggaran-jenis").value.trim();
  const poin = document.getElementById("pelanggaran-poin").value;
  const tahun = (typeof CONFIG !== "undefined" && CONFIG.DEFAULT_TAHUN_AJARAN) ? CONFIG.DEFAULT_TAHUN_AJARAN : "";

  const payload = { jenis, poin, tahun_ajaran: tahun };
  const action = id ? "updateJenisPelanggaran" : "addJenisPelanggaran";
  if (id) payload.id = id;

  try {
    let res;
    if (typeof API !== "undefined" && API.post) {
      res = await API.post(action, payload);
    }

    if (res && res.status === "success") {
      alert(res.message || "Data berhasil disimpan!");
      resetPelanggaranForm();
      loadJenisPelanggaran();
    } else {
      alert(res ? res.message : "Gagal menyimpan data.");
    }
  } catch (err) {
    console.error("Error saving pelanggaran:", err);
    alert("Terjadi kesalahan sistem.");
  }
}

// Mengisi Form untuk Edit
function editPelanggaran(id) {
  const item = cachePelanggaranList.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById("pelanggaran-id").value = item.id;
  document.getElementById("pelanggaran-jenis").value = item.jenis;
  document.getElementById("pelanggaran-poin").value = item.poin;
}

// Reset Form
function resetPelanggaranForm() {
  document.getElementById("form-pelanggaran").reset();
  document.getElementById("pelanggaran-id").value = "";
}

// Menghapus Data Jenis Pelanggaran
async function handleDeletePelanggaran(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus jenis pelanggaran ini?")) return;

  try {
    let res;
    if (typeof API !== "undefined" && API.post) {
      res = await API.post("deleteJenisPelanggaran", { id: id });
    }

    if (res && res.status === "success") {
      alert("Jenis pelanggaran berhasil dihapus!");
      loadJenisPelanggaran();
    } else {
      alert(res ? res.message : "Gagal menghapus.");
    }
  } catch (err) {
    console.error("Error deleting pelanggaran:", err);
    alert("Terjadi kesalahan sistem saat menghapus.");
  }
}
