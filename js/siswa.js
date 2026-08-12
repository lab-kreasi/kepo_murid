(() => {
  let cacheSiswaList = [];

  function init() {
    if (typeof Auth !== "undefined" && typeof Auth.checkAuth === "function") {
      Auth.checkAuth();
    }
    loadDataSiswa();
  }

  async function loadDataSiswa() {
    const tbody = document.getElementById("tbody-siswa");
    if (!tbody) return;

    const search = document.getElementById("search-siswa")?.value || "";
    const kelas = document.getElementById("filter-kelas")?.value || "";

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3 text-muted">Memuat data...</td></tr>';

    try {
      let res;
      if (typeof API !== "undefined" && API.get) {
        res = await API.get("getSiswa", { search: search, kelas: kelas });
      } else if (typeof ApiService !== "undefined" && ApiService.getSiswa) {
        res = await ApiService.getSiswa("", kelas, search);
      }

      if (res && res.status === "success") {
        cacheSiswaList = res.data || [];
        renderTableSiswa(cacheSiswaList);
      } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-danger">${res ? res.message : "Gagal memuat data"}</td></tr>`;
      }
    } catch (err) {
      console.error("Gagal memuat data siswa:", err);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3 text-danger">Koneksi terputus atau terjadi kesalahan.</td></tr>';
    }
  }

  function renderTableSiswa(data) {
    const tbody = document.getElementById("tbody-siswa");
    if (!tbody) return;

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3 text-muted">Data siswa tidak ditemukan.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((item, index) => {
      const isAktif = String(item.status).toLowerCase() === "aktif";
      const badgeStatus = isAktif ? "bg-success" : "bg-secondary";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nis}</td>
          <td><strong class="text-dark">${item.nama}</strong></td>
          <td>${item.kelas}</td>
          <td><span class="badge ${badgeStatus}">${item.status || "Aktif"}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-warning me-1" onclick="editSiswa('${item.id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteSiswa('${item.id}')">Hapus</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function handleSaveSiswa(e) {
    if (e && e.preventDefault) e.preventDefault();

    const id = document.getElementById("siswa-id")?.value;
    const nis = document.getElementById("siswa-nis")?.value.trim();
    const nama = document.getElementById("siswa-nama")?.value.trim();
    const kelas = document.getElementById("siswa-kelas")?.value.trim();
    const status = document.getElementById("siswa-status")?.value;

    const payload = { nis, nama, kelas, status };
    const action = id ? "updateSiswa" : "addSiswa";
    if (id) payload.id = id;

    const btnSubmit = document.getElementById("btn-save-siswa");

    try {
      if (btnSubmit) btnSubmit.disabled = true;

      let res;
      if (typeof API !== "undefined" && API.post) {
        res = await API.post(action, payload);
      }

      if (res && res.status === "success") {
        alert(res.message || "Data berhasil disimpan!");
        resetSiswaForm();
        loadDataSiswa();
      } else {
        alert(res ? res.message : "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("Error saving siswa:", err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  }

  function editSiswa(id) {
    const item = cacheSiswaList.find(s => String(s.id) === String(id));
    if (!item) return;

    const idInput = document.getElementById("siswa-id");
    const nisInput = document.getElementById("siswa-nis");
    const namaInput = document.getElementById("siswa-nama");
    const kelasInput = document.getElementById("siswa-kelas");
    const statusInput = document.getElementById("siswa-status");

    if (idInput) idInput.value = item.id;
    if (nisInput) nisInput.value = item.nis;
    if (namaInput) namaInput.value = item.nama;
    if (kelasInput) kelasInput.value = item.kelas;
    if (statusInput) statusInput.value = item.status || "Aktif";

    const formTitle = document.getElementById("form-title");
    if (formTitle) formTitle.innerText = "Edit Data Siswa";

    const btnSubmit = document.getElementById("btn-save-siswa");
    if (btnSubmit) btnSubmit.innerText = "Update";
  }

  function resetSiswaForm() {
    const form = document.getElementById("form-siswa");
    if (form) form.reset();
    const idInput = document.getElementById("siswa-id");
    if (idInput) idInput.value = "";

    const formTitle = document.getElementById("form-title");
    if (formTitle) formTitle.innerText = "Form Data Siswa";

    const btnSubmit = document.getElementById("btn-save-siswa");
    if (btnSubmit) btnSubmit.innerText = "Simpan";
  }

  async function handleDeleteSiswa(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) return;

    try {
      let res;
      if (typeof API !== "undefined" && API.post) {
        res = await API.post("deleteSiswa", { id: id });
      }

      if (res && res.status === "success") {
        alert("Siswa berhasil dihapus!");
        loadDataSiswa();
      } else {
        alert(res ? res.message : "Gagal menghapus siswa.");
      }
    } catch (err) {
      console.error("Error deleting siswa:", err);
      alert("Terjadi kesalahan sistem saat menghapus.");
    }
  }

  window.loadDataSiswa = loadDataSiswa;
  window.renderTableSiswa = renderTableSiswa;
  window.handleSaveSiswa = handleSaveSiswa;
  window.editSiswa = editSiswa;
  window.resetSiswaForm = resetSiswaForm;
  window.handleDeleteSiswa = handleDeleteSiswa;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();