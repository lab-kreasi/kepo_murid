/**
 * Logic Master Jenis Pelanggaran (jenis-pelanggaran.html)
 */
let currentPelanggaranData = [];

document.addEventListener("DOMContentLoaded", () => {
  Auth.protectPage();
  loadJenisPelanggaran();
});

async function loadJenisPelanggaran() {
  const res = await ApiService.getJenisPelanggaran(CONFIG.DEFAULT_TAHUN_AJARAN);
  if (res.status === "success") {
    currentPelanggaranData = res.data;
    renderPelanggaranTable(currentPelanggaranData);
  } else {
    alert(res.message);
  }
}

function renderPelanggaranTable(data) {
  const tbody = document.getElementById("tbody-pelanggaran");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada jenis pelanggaran.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.jenis}</td>
      <td><span class="badge bg-danger">${p.poin} Poin</span></td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editPelanggaran('${p.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePelanggaran('${p.id}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

async function handleSavePelanggaran(event) {
  event.preventDefault();
  const id = document.getElementById("pelanggaran-id").value;
  const payload = {
    id: id,
    jenis: document.getElementById("pelanggaran-jenis").value,
    poin: Number(document.getElementById("pelanggaran-poin").value),
    tahun_ajaran: CONFIG.DEFAULT_TAHUN_AJARAN
  };

  const res = id ? await ApiService.updateJenisPelanggaran(id, payload) : await ApiService.addJenisPelanggaran(payload);
  alert(res.message);

  if (res.status === "success") {
    resetPelanggaranForm();
    loadJenisPelanggaran();
  }
}

function editPelanggaran(id) {
  const item = currentPelanggaranData.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById("pelanggaran-id").value = item.id;
  document.getElementById("pelanggaran-jenis").value = item.jenis;
  document.getElementById("pelanggaran-poin").value = item.poin;
}

async function deletePelanggaran(id) {
  if (confirm("Hapus jenis pelanggaran ini?")) {
    const res = await ApiService.deleteJenisPelanggaran(id);
    alert(res.message);
    if (res.status === "success") loadJenisPelanggaran();
  }
}

function resetPelanggaranForm() {
  document.getElementById("form-pelanggaran")?.reset();
  document.getElementById("pelanggaran-id").value = "";
}
