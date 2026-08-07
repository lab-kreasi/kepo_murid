async function simpanTerlambat(siswaId) {
  const payload = {
    siswa_id: siswaId,
    pelanggaran_id: "1", // ID Pelanggaran Terlambat
    poin: 5,
    tanggal: new Date().toISOString().split('T')[0],
    tahun_ajaran: CONFIG.DEFAULT_TAHUN_AJARAN
  };

  const response = await ApiService.quickRecord(payload);
  alert(response.message);
}
