/**
 * Module API Service untuk menghubungkan Frontend ke Backend Google Apps Script
 */
const ApiService = {
  
  /**
   * Helper Internal untuk HTTP GET
   */
  async _get(action, params = {}) {
    try {
      const urlParams = new URLSearchParams({ action, ...params });
      const response = await fetch(`${CONFIG.API_URL}?${urlParams.toString()}`);
      
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[API GET ERROR] Action: ${action}`, error);
      return { status: "error", message: "Gagal terhubung ke server: " + error.message };
    }
  },

  /**
   * Helper Internal untuk HTTP POST
   */
  async _post(action, payload = {}) {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        // Penting: Menggunakan text/plain;charset=utf-8 untuk menghindari pembatasan CORS Preflight pada Google Apps Script
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, data: payload })
      });

      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[API POST ERROR] Action: ${action}`, error);
      return { status: "error", message: "Gagal mengirim data ke server: " + error.message };
    }
  },

  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================
  login: (username, password) => 
    ApiService._post("login", { username, password }),

  // ==========================================
  // 2. SISWA CONTROLLER
  // ==========================================
  getSiswa: (tahun = CONFIG.DEFAULT_TAHUN_AJARAN, kelas = "", search = "") => 
    ApiService._get("getSiswa", { tahun, kelas, search }),

  addSiswa: (siswaData) => 
    ApiService._post("addSiswa", siswaData),

  updateSiswa: (id, siswaData) => 
    ApiService._post("updateSiswa", { id, ...siswaData }),

  deleteSiswa: (id) => 
    ApiService._post("deleteSiswa", { id }),

  // ==========================================
  // 3. JENIS PELANGGARAN CONTROLLER
  // ==========================================
  getJenisPelanggaran: (tahun = CONFIG.DEFAULT_TAHUN_AJARAN) => 
    ApiService._get("getJenisPelanggaran", { tahun }),

  addJenisPelanggaran: (pelanggaranData) => 
    ApiService._post("addJenisPelanggaran", pelanggaranData),

  updateJenisPelanggaran: (id, pelanggaranData) => 
    ApiService._post("updateJenisPelanggaran", { id, ...pelanggaranData }),

  deleteJenisPelanggaran: (id) => 
    ApiService._post("deleteJenisPelanggaran", { id }),

  // ==========================================
  // 4. CATATAN PELANGGARAN CONTROLLER
  // ==========================================
  getCatatan: (tahun = CONFIG.DEFAULT_TAHUN_AJARAN, siswaId = "") => 
    ApiService._get("getCatatan", { tahun, siswa_id: siswaId }),

  addCatatan: (catatanData) => 
    ApiService._post("addCatatan", catatanData),

  quickRecord: (quickData) => 
    ApiService._post("quickRecord", quickData),

  deleteCatatan: (id) => 
    ApiService._post("deleteCatatan", { id }),

  // ==========================================
  // 5. REPORT & DASHBOARD CONTROLLER
  // ==========================================
  getDashboardData: (tahun = CONFIG.DEFAULT_TAHUN_AJARAN) => 
    ApiService._get("getDashboardData", { tahun }),

  getRankingSiswa: (tahun = CONFIG.DEFAULT_TAHUN_AJARAN, limit = "") => 
    ApiService._get("getRankingSiswa", { tahun, limit })
};
