/**
 * Logic Kelola Data Siswa (siswa.html)
 */
let currentSiswaData = [];

document.addEventListener("DOMContentLoaded", () => {
  Auth.protectPage();
  loadDataSiswa();
});

async function loadDataSiswa() {
  const kelas = document.getElementById("filter-kelas")?.value || "";
  const search = document.getElementById("search-siswa")?.value || "";

  const res = await ApiService.getSiswa(CONFIG.DEFAULT_TAHUN_AJARAN, kelas, search);
  if (res.status === "success") {
    currentSiswaData = res.data;
    renderSiswaTable(currentSiswaData);
  } else {
    alert(res.message);
  }
}

function renderSiswaTable(data) {
  const tbody = document.getElementById("tbody-siswa");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Data siswa tidak ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.nis}</td>
      <td><strong>${s.nama}</strong></td>
      <td>${s.kelas}</td>
      <td><span class="badge ${s.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">${s.status}</span></td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editSiswa('${s.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSiswa('${s.id}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

async function handleSaveSiswa(event) {
  event.preventDefault();
  const id = document.getElementById("siswa-id").value;
  const payload = {
    id: id,
    nis: document.getElementById("siswa-nis").value,
    nama: document.getElementById("siswa-nama").value,
    kelas: document.getElementById("siswa-kelas").value,
    status: document.getElementById("siswa-status").value,
    tahun_ajaran: CONFIG.DEFAULT_TAHUN_AJARAN
  };

  const res = id ? await ApiService.updateSiswa(id, payload) : await ApiService.addSiswa(payload);
  alert(res.message);

  if (res.status === "success") {
    resetSiswaForm();
    loadDataSiswa();
  }
}

function editSiswa(id) {
  const siswa = currentSiswaData.find(s => String(s.id) === String(id));
  if (!siswa) return;

  document.getElementById("siswa-id").value = siswa.id;
  document.getElementById("siswa-nis").value = siswa.nis;
  document.getElementById("siswa-nama").value = siswa.nama;
  document.getElementById("siswa-kelas").value = siswa.kelas;
  document.getElementById("siswa-status").value = siswa.status;
}

async function deleteSiswa(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
    const res = await ApiService.deleteSiswa(id);
    alert(res.message);
    if (res.status === "success") loadDataSiswa();
  }
}

function resetSiswaForm() {
  document.getElementById("form-siswa")?.reset();
  document.getElementById("siswa-id").value = "";
}
