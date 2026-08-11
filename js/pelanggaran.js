// Variabel global penampung data
let dataPelanggaran = [];

// Fungsi otomatis dipanggil saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
  loadJenisPelanggaran();
});

/**
 * Membaca data Jenis Pelanggaran dari Spreadsheet melalui API
 */
async function loadJenisPelanggaran() {
  const tbody = document.getElementById('tbody-pelanggaran');
  
  try {
    // Memanggil API GET (sesuaikan nama 'getJenisPelanggaran' dengan Apps Script Anda)
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

/**
 * Merender array data ke baris tabel HTML
 */
function renderTablePelanggaran(data) {
  const tbody = document.getElementById('tbody-pelanggaran');
  
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

/**
 * Menyimpan data (Tambah / Edit) ke Spreadsheet
 */
async function handleSavePelanggaran(event) {
  event.preventDefault();
  
  const id = document.getElementById('pelanggaran-id').value;
  const jenis = document.getElementById('pelanggaran-jenis').value.trim();
  const poin = document.getElementById('pelanggaran-poin').value;
  const btnSubmit = document.getElementById('btn-submit-pelanggaran');

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = 'Menyimpan...';

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
      await loadJenisPelanggaran(); // Refresh tabel
    } else {
      alert(res.message || 'Gagal menyimpan data.');
    }
  } catch (err) {
    console.error('Error saat menyimpan:', err);
    alert('Terjadi kesalahan koneksi saat menyimpan.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Simpan';
  }
}

/**
 * Mengisi form untuk mode edit
 */
function editPelanggaran(id) {
  const item = dataPelanggaran.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById('pelanggaran-id').value = item.id;
  document.getElementById('pelanggaran-jenis').value = item.nama || item.jenis;
  document.getElementById('pelanggaran-poin').value = item.poin;
  document.getElementById('btn-submit-pelanggaran').innerText = 'Update';
}

/**
 * Mereset isian form
 */
function resetPelanggaranForm() {
  document.getElementById('form-pelanggaran').reset();
  document.getElementById('pelanggaran-id').value = '';
  document.getElementById('btn-submit-pelanggaran').innerText = 'Simpan';
}

/**
 * Menghapus data dari Spreadsheet
 */
async function deletePelanggaran(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus jenis pelanggaran ini?')) return;

  try {
    const res = await API.post({ action: 'deleteJenisPelanggaran', id });
    if (res && res.status === 'success') {
      await loadJenisPelanggaran();
    } else {
      alert(res.message || 'Gagal menghapus data.');
    }
  } catch (err) {
    console.error('Error saat menghapus:', err);
    alert('Terjadi kesalahan koneksi.');
  }
}
