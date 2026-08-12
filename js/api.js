/**
 * Module API Service untuk menghubungkan Frontend ke Backend Google Apps Script
 * Dilengkapi dengan Auto-Injection Kredensial untuk Verifikasi Server-Side
 */
const ApiService = {

  /**
   * Helper Internal untuk Mengambil Kredensial Sesi Aktif
   */
  _getAuthCredentials() {
    try {
      // 1. Cek via Module Auth jika tersedia
      if (typeof Auth !== 'undefined' && typeof Auth.getUserSession === 'function') {
        const user = Auth.getUserSession();
        if (user) {
          return {
            username: user.username || "",
            password: user.password || ""
          };
        }
      }
      // 2. Fallback pembacaan langsung dari LocalStorage / SessionStorage
      const stored = localStorage.getItem("kepo_user") || sessionStorage.getItem("kepo_user");
      if (stored) {
        const user = JSON.parse(stored);
        return {
          username: user.username || "",
          password: user.password || ""
        };
      }
    } catch (e) {
      console.warn("[API SERVICE] Gagal membaca kredensial sesi:", e);
    }
    return { username: "", password: "" };
  },

  /**
   * Helper Internal untuk HTTP GET
   */
  async _get(action, params = {}) {
    try {
      if (typeof CONFIG === 'undefined' || !CONFIG.API_URL) {
        throw new Error("CONFIG.API_URL belum dikonfigurasi di js/config.js");
      }

      const creds = this._getAuthCredentials();
      const urlParams = new URLSearchParams();

      // Set parameter dasar & kredensial wajib server-side
      urlParams.append("action", action);
      if (creds.username) urlParams.append("username", creds.username);
      if (creds.password) urlParams.append("password", creds.password);

      // Tambahkan parameter kustom (hanya nilai valid)
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          urlParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${CONFIG.API_URL}?${urlParams.toString()}`, {
        method: "GET",
        redirect: "follow" // WAJIB: Google Apps Script melakukan 302 Redirect
      });

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
      if (typeof CONFIG === 'undefined' || !CONFIG.API_URL) {
        throw new Error("CONFIG.API_URL belum dikonfigurasi di js/config.js");
      }

      const creds = this._getAuthCredentials();

      // Struktur Body POST disesuaikan agar terbaca oleh Code.gs
      const requestBody = {
        action: action,
        username: payload.username || creds.username,
        password: payload.password || creds.password,
        data: payload
      };

      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        redirect: "follow", // WAJIB: Google Apps Script melakukan 302 Redirect
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[API POST ERROR] Action: ${action}`, error);
      return { status: "error", message: "Gagal mengirim data ke server: " + error.message };
    }
  },

  // ==========================================
  // GENERIK METHOD (Kompatibilitas Frontend)
  // ==========================================
  get: (action, params) => ApiService._get(action, params),
  post: (payload, extraData = {}) => {
    if (typeof payload === 'string') {
      return ApiService._post(payload, extraData);
    }
    const { action, ...data } = payload || {};
    return ApiService._post(action, data.data || data);
  },

  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================
  login: (username, password) => 
    ApiService._post("login", { username, password }),

  // ==========================================
  // 2. SISWA CONTROLLER
  // ==========================================
  getSiswa: (tahun = "", kelas = "", search = "") => 
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
  getJenisPelanggaran: (tahun = "") => 
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
  getCatatan: (tahun = CONFIG?.DEFAULT_TAHUN_AJARAN, siswaId = "") => 
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
  getDashboardData: (tahun = CONFIG?.DEFAULT_TAHUN_AJARAN) => 
    ApiService._get("getDashboardData", { tahun }),

  getRankingSiswa: (tahun = CONFIG?.DEFAULT_TAHUN_AJARAN, limit = "") => 
    ApiService._get("getRankingSiswa", { tahun, limit }),

  // ==========================================
  // 6. JENIS PRESTASI CONTROLLER
  // ==========================================
  getJenisPrestasi: (tahun = "") => 
    ApiService._get("getJenisPrestasi", { tahun }),

  addJenisPrestasi: (prestasiData) => 
    ApiService._post("addJenisPrestasi", prestasiData),

  updateJenisPrestasi: (id, prestasiData) => 
    ApiService._post("updateJenisPrestasi", { id, ...prestasiData }),

  deleteJenisPrestasi: (id) => 
    ApiService._post("deleteJenisPrestasi", { id })
};

// Alias Global agar kompatibel jika skrip panggilan menggunakan 'API' atau 'ApiService'
const API = ApiService;
