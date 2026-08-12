(() => {
  let dataPelanggaran = [];

  function init() {
    loadJenisPelanggaran();
  }

  async function loadJenisPelanggaran() {
    const tbody = document.getElementById('tbody-pelanggaran');
    if (!tbody) return;
    
    try {
      const response = await API.get('getJenisPelanggaran');

      if (response && response.status === 'success' && Array.isArray(response.data)) {
        dataPelanggaran = response.data;
        renderTablePelanggaran(dataPelanggaran);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="py-6 text-center text-slate-400">Belum ada jenis pelanggaran.</td>
          </tr>`;
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-6 text-center text-red-500 text-xs">
            Gagal mengambil data dari Spreadsheet. Periksa koneksi atau URL API Anda.
          </td>
        </tr>`;
    }
  }

  function renderTablePelanggaran(data) {
    const tbody = document.getElementById('tbody-pelanggaran');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-6 text-center text-slate-400">Belum ada jenis pelanggaran.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.map((item, index) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-4 text-center text-slate-400">${index + 1}</td>
        <td class="py-3 px-4 font-semibold text-slate-800">${item.nama || item.jenis || '-'}</td>
        <td class="py-3 px-4 text-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            ${item.poin} Poin
          </span>
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="editPelanggaran('${item.id}')" class="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button onclick="deletePelanggaran('${item.id}')" class="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition" title="Hapus">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async function handleSavePelanggaran(event) {
    if (event && event.preventDefault) event.preventDefault();
    
    const id = document.getElementById('pelanggaran-id')?.value;
    const jenis = document.getElementById('pelanggaran-jenis')?.value.trim();
    const poin = document.getElementById('pelanggaran-poin')?.value;
    const btnSubmit = document.getElementById('btn-submit-pelanggaran');

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = 'Menyimpan...';
    }

    const payload = {
      action: id ? 'updateJenisPelanggaran' : 'addJenisPelanggaran',
      id: id || undefined,
      jenis: jenis,
      poin: Number(poin)
    };

    try {
      const res = await API.post(payload);
      if (res && res.status === 'success') {
        resetPelanggaranForm();
        await loadJenisPelanggaran();
      } else {
        alert(res?.message || 'Gagal menyimpan data.');
      }
    } catch (err) {
      console.error('Error saat menyimpan:', err);
      alert('Terjadi kesalahan koneksi saat menyimpan.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Simpan';
      }
    }
  }

  function editPelanggaran(id) {
    const item = dataPelanggaran.find(p => String(p.id) === String(id));
    if (!item) return;

    const idInput = document.getElementById('pelanggaran-id');
    const jenisInput = document.getElementById('pelanggaran-jenis');
    const poinInput = document.getElementById('pelanggaran-poin');
    const btnSubmit = document.getElementById('btn-submit-pelanggaran');

    if (idInput) idInput.value = item.id;
    if (jenisInput) jenisInput.value = item.nama || item.jenis;
    if (poinInput) poinInput.value = item.poin;
    if (btnSubmit) btnSubmit.innerText = 'Update';
  }

  function resetPelanggaranForm() {
    const form = document.getElementById('form-pelanggaran');
    if (form) form.reset();
    const idInput = document.getElementById('pelanggaran-id');
    if (idInput) idInput.value = '';
    const btnSubmit = document.getElementById('btn-submit-pelanggaran');
    if (btnSubmit) btnSubmit.innerText = 'Simpan';
  }

  async function deletePelanggaran(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus jenis pelanggaran ini?')) return;

    try {
      const res = await API.post({ action: 'deleteJenisPelanggaran', id });
      if (res && res.status === 'success') {
        await loadJenisPelanggaran();
      } else {
        alert(res?.message || 'Gagal menghapus data.');
      }
    } catch (err) {
      console.error('Error saat menghapus:', err);
      alert('Terjadi kesalahan koneksi.');
    }
  }

  window.loadJenisPelanggaran = loadJenisPelanggaran;
  window.handleSavePelanggaran = handleSavePelanggaran;
  window.editPelanggaran = editPelanggaran;
  window.resetPelanggaranForm = resetPelanggaranForm;
  window.deletePelanggaran = deletePelanggaran;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();