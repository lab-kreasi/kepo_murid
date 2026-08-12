(() => {
  let listPrestasi = [];

  function init() {
    loadJenisPrestasi();
  }

  async function loadJenisPrestasi() {
    const tbody = document.getElementById("tbody-prestasi");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-slate-400">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mb-2"></div>
          <p class="text-xs font-medium">Memuat data dari Spreadsheet...</p>
        </td>
      </tr>
    `;

    try {
      const response = await API.getJenisPrestasi();

      if (response && response.status === "success") {
        listPrestasi = response.data || [];
        renderTabelPrestasi(listPrestasi);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="py-6 text-center text-rose-500 font-semibold text-sm">
              ${response?.message || "Gagal mengambil data dari Spreadsheet."}
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error("Error loadJenisPrestasi:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-6 text-center text-rose-500 font-semibold text-sm">
            Gagal terhubung ke server. Periksa koneksi atau URL API Anda.
          </td>
        </tr>
      `;
    }
  }

  function renderTabelPrestasi(data) {
    const tbody = document.getElementById("tbody-prestasi");
    if (!tbody) return;

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-6 text-center text-slate-400 text-sm">
            Belum ada data jenis prestasi.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map((item, index) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3.5 px-4 text-center text-slate-500 text-xs">${index + 1}</td>
        <td class="py-3.5 px-4 font-semibold text-slate-800">${item.jenis || item.nama || '-'}</td>
        <td class="py-3.5 px-4 text-center">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            -${item.poin || 0} Poin
          </span>
        </td>
        <td class="py-3.5 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="editPrestasi('${item.id}')" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button onclick="deletePrestasi('${item.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async function handleSavePrestasi(event) {
    if (event && event.preventDefault) event.preventDefault();
    const submitBtn = event ? event.target.querySelector('button[type="submit"]') : document.querySelector('#form-prestasi button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : "";

    const id = document.getElementById("prestasi-id")?.value;
    const jenis = document.getElementById("prestasi-jenis")?.value.trim();
    const poin = document.getElementById("prestasi-poin")?.value;

    if (!jenis || !poin) {
      alert("Harap isi seluruh bidang form!");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Menyimpan...";
    }

    try {
      let res;
      if (id) {
        res = await API.updateJenisPrestasi(id, { jenis, poin: Number(poin) });
      } else {
        res = await API.addJenisPrestasi({ jenis, poin: Number(poin) });
      }

      if (res && res.status === "success") {
        alert(res.message || "Data prestasi berhasil disimpan!");
        resetPrestasiForm();
        loadJenisPrestasi();
      } else {
        alert("Gagal: " + (res?.message || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat menyimpan data.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    }
  }

  function editPrestasi(id) {
    const item = listPrestasi.find(p => String(p.id) === String(id));
    if (!item) return;

    const idInput = document.getElementById("prestasi-id");
    const jenisInput = document.getElementById("prestasi-jenis");
    const poinInput = document.getElementById("prestasi-poin");

    if (idInput) idInput.value = item.id;
    if (jenisInput) jenisInput.value = item.jenis || item.nama || '';
    if (poinInput) poinInput.value = item.poin || '';

    const submitBtn = document.querySelector('#form-prestasi button[type="submit"]');
    if (submitBtn) submitBtn.innerText = "Update Prestasi";
  }

  async function deletePrestasi(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus jenis prestasi ini?")) return;

    try {
      const res = await API.deleteJenisPrestasi(id);
      if (res && res.status === "success") {
        alert(res.message || "Data berhasil dihapus!");
        loadJenisPrestasi();
      } else {
        alert("Gagal menghapus: " + (res?.message || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  }

  function resetPrestasiForm() {
    const form = document.getElementById("form-prestasi");
    if (form) form.reset();
    const idInput = document.getElementById("prestasi-id");
    if (idInput) idInput.value = "";
    const submitBtn = document.querySelector('#form-prestasi button[type="submit"]');
    if (submitBtn) submitBtn.innerText = "Simpan Prestasi";
  }

  window.loadJenisPrestasi = loadJenisPrestasi;
  window.handleSavePrestasi = handleSavePrestasi;
  window.editPrestasi = editPrestasi;
  window.deletePrestasi = deletePrestasi;
  window.resetPrestasiForm = resetPrestasiForm;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();