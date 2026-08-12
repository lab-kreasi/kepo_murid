(() => {
  if (window.ApiService) return;

  const ApiService = {
    _getApiUrl() {
      if (typeof CONFIG !== 'undefined') {
        const url = CONFIG.API_URL || CONFIG.BASE_URL;
        if (url) return url;
      } else if (typeof window !== 'undefined' && window.CONFIG) {
        const url = window.CONFIG.API_URL || window.CONFIG.BASE_URL;
        if (url) return url;
      }
      throw new Error("URL API belum dikonfigurasi. Pastikan CONFIG.API_URL atau CONFIG.BASE_URL ada di js/config.js");
    },

    _getAuthCredentials() {
      try {
        if (typeof Auth !== 'undefined') {
          const user = (typeof Auth.getUserSession === 'function') 
            ? Auth.getUserSession() 
            : (typeof Auth.getUser === 'function' ? Auth.getUser() : null);
          
          if (user) {
            return {
              username: user.username || "",
              password: user.password || ""
            };
          }
        }

        const stored = localStorage.getItem("user") || 
                       sessionStorage.getItem("user") || 
                       localStorage.getItem("kepo_user") || 
                       sessionStorage.getItem("kepo_user");
        
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

    _getCache(cacheKey) {
      try {
        const cached = sessionStorage.getItem("kepo_api_cache_" + cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return null;
    },

    _setCache(cacheKey, data) {
      try {
        sessionStorage.setItem("kepo_api_cache_" + cacheKey, JSON.stringify(data));
      } catch (e) {}
    },

    clearCache() {
      try {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith("kepo_api_cache_")) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (e) {}
    },

    async _parseResponse(response) {
      const textData = await response.text();
      try {
        return JSON.parse(textData);
      } catch (e) {
        console.error("[API PARSE ERROR] Respons bukan JSON valid:", textData.substring(0, 150));
        throw new Error("Respons dari server tidak valid. Pastikan URL dan Izin Google Apps Script sudah benar.");
      }
    },

    async _get(action, params = {}, forceRefresh = false) {
      try {
        const baseUrl = this._getApiUrl();
        const creds = this._getAuthCredentials();
        const urlParams = new URLSearchParams();

        urlParams.append("action", action);
        if (creds.username) urlParams.append("username", creds.username);
        if (creds.password) urlParams.append("password", creds.password);

        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            urlParams.append(key, params[key]);
          }
        });

        const cacheKey = `${action}_${urlParams.toString()}`;

        if (!forceRefresh) {
          const cachedResult = this._getCache(cacheKey);
          if (cachedResult) return cachedResult;
        }

        const separator = baseUrl.includes("?") ? "&" : "?";
        const finalUrl = `${baseUrl}${separator}${urlParams.toString()}`;

        const response = await fetch(finalUrl, {
          method: "GET",
          redirect: "follow"
        });

        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
        
        const result = await this._parseResponse(response);

        if (result && result.status !== 'error') {
          this._setCache(cacheKey, result);
        }

        return result;

      } catch (error) {
        console.error(`[API GET ERROR] Action: ${action}`, error);
        return { status: "error", message: "Gagal terhubung ke server: " + error.message };
      }
    },

    async _post(action, payload = {}) {
      try {
        const baseUrl = this._getApiUrl();
        const creds = this._getAuthCredentials();

        const requestBody = {
          action: action,
          username: payload.username || creds.username || "",
          password: payload.password || creds.password || "",
          data: payload
        };

        Object.keys(payload).forEach(key => {
          if (key !== 'username' && key !== 'password') {
            requestBody[key] = payload[key];
          }
        });

        const response = await fetch(baseUrl, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
        
        const result = await this._parseResponse(response);

        if (action !== "login" && result && result.status !== "error") {
          this.clearCache();
        }

        return result;

      } catch (error) {
        console.error(`[API POST ERROR] Action: ${action}`, error);
        return { status: "error", message: "Gagal mengirim data ke server: " + error.message };
      }
    },

    get: (action, params, forceRefresh) => ApiService._get(action, params, forceRefresh),
    
    post: (payload, extraData = {}) => {
      if (typeof payload === 'string') {
        return ApiService._post(payload, extraData);
      }
      const { action, ...data } = payload || {};
      return ApiService._post(action, data.data || data);
    },

    login: (username, password) => 
      ApiService._post("login", { username, password }),

    getSiswa: (tahun = "", kelas = "", search = "", forceRefresh = false) => 
      ApiService._get("getSiswa", { tahun, kelas, search }, forceRefresh),

    addSiswa: (siswaData) => 
      ApiService._post("addSiswa", siswaData),

    updateSiswa: (id, siswaData) => 
      ApiService._post("updateSiswa", { id, ...siswaData }),

    deleteSiswa: (id) => 
      ApiService._post("deleteSiswa", { id }),

    getJenisPelanggaran: (tahun = "", forceRefresh = false) => 
      ApiService._get("getJenisPelanggaran", { tahun }, forceRefresh),

    addJenisPelanggaran: (pelanggaranData) => 
      ApiService._post("addJenisPelanggaran", pelanggaranData),

    updateJenisPelanggaran: (id, pelanggaranData) => 
      ApiService._post("updateJenisPelanggaran", { id, ...pelanggaranData }),

    deleteJenisPelanggaran: (id) => 
      ApiService._post("deleteJenisPelanggaran", { id }),

    getCatatan: (tahun = "", siswaId = "", forceRefresh = false) => {
      const t = tahun || (typeof CONFIG !== 'undefined' ? CONFIG.DEFAULT_TAHUN_AJARAN : "");
      return ApiService._get("getCatatan", { tahun: t, siswa_id: siswaId }, forceRefresh);
    },

    addCatatan: (catatanData) => 
      ApiService._post("addCatatan", catatanData),

    quickRecord: (quickData) => 
      ApiService._post("quickRecord", quickData),

    deleteCatatan: (id) => 
      ApiService._post("deleteCatatan", { id }),

    getDashboardData: (tahun = "", forceRefresh = false) => {
      const t = tahun || (typeof CONFIG !== 'undefined' ? CONFIG.DEFAULT_TAHUN_AJARAN : "");
      return ApiService._get("getDashboardData", { tahun: t }, forceRefresh);
    },

    getRankingSiswa: (tahun = "", limit = "", forceRefresh = false) => {
      const t = tahun || (typeof CONFIG !== 'undefined' ? CONFIG.DEFAULT_TAHUN_AJARAN : "");
      return ApiService._get("getRankingSiswa", { tahun: t, limit }, forceRefresh);
    },

    getJenisPrestasi: (tahun = "", forceRefresh = false) => 
      ApiService._get("getJenisPrestasi", { tahun }, forceRefresh),

    addJenisPrestasi: (prestasiData) => 
      ApiService._post("addJenisPrestasi", prestasiData),

    updateJenisPrestasi: (id, prestasiData) => 
      ApiService._post("updateJenisPrestasi", { id, ...prestasiData }),

    deleteJenisPrestasi: (id) => 
      ApiService._post("deleteJenisPrestasi", { id })
  };

  window.API = ApiService;
  window.ApiService = ApiService;
})();