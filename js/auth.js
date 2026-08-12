/**
 * js/auth.js
 * Auth Module - Keamanan, Akses Role & Anti-Looping System dengan Console Debugger
 */
const Auth = {
  STORAGE_KEY: "kepo_user",

  // Pemetaan Hak Akses Halaman per Role
  ROLE_PERMISSIONS: {
    admin: "*",
    user: [
      "index.html",
      "input-pelanggaran.html",
      "input-prestasi.html",
      "siswa.html",
      "laporan.html",
      "jenis-pelanggaran.html",
      "jenis-prestasi.html"
    ],
    piket: [
      "input-pelanggaran.html",
      "input-prestasi.html",
      "laporan.html"
    ],
    guru: [
      "laporan.html" // Role Guru HANYA boleh mengakses Laporan
    ]
  },

  // Halaman Utama Default per Role
  DEFAULT_PAGE: {
    admin: "index.html",
    user: "index.html",
    piket: "input-pelanggaran.html",
    guru: "laporan.html"
  },

  setUserSession(userData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
  },

  getUserSession() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      
      const user = JSON.parse(raw);
      if (user && typeof user === "object" && (user.username || user.nama_guru) && user.role) {
        return user;
      }
    } catch (e) {
      console.error("[Auth] Sesi corrupt:", e);
    }
    return null;
  },

  logout() {
    console.warn("[Auth] Logging out user...");
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem("_auth_redirect_cnt");
    window.location.replace("login.html");
  },

  getCurrentPage() {
    let path = window.location.pathname.split("?")[0].split("#")[0];
    let lastSegment = path.split("/").filter(Boolean).pop() || "index.html";

    const validPages = [
      "index", "login", "siswa", "laporan", 
      "input-pelanggaran", "input-prestasi", 
      "jenis-pelanggaran", "jenis-prestasi"
    ];

    let cleanName = lastSegment.replace(/\.html$/i, "").toLowerCase();

    if (validPages.includes(cleanName)) {
      return cleanName + ".html";
    }

    return "index.html";
  },

  async handleLogin(username, password) {
    if (!username || !password) {
      return { status: "error", message: "Username dan Password wajib diisi!" };
    }

    try {
      const res = await ApiService.login(username, password);
      if (res && res.status === "success" && res.data) {
        const sessionData = {
          ...res.data,
          username: res.data.username || username,
          role: String(res.data.role || "guru").toLowerCase().trim(),
          password: password
        };

        this.setUserSession(sessionData);
        sessionStorage.removeItem("_auth_redirect_cnt");
        return { status: "success", data: sessionData };
      }
      return res || { status: "error", message: "Username atau password salah!" };
    } catch (err) {
      console.error("[Auth] Login error:", err);
      return { status: "error", message: "Gagal terhubung ke server." };
    }
  },

  checkAccess() {
    const currentPage = this.getCurrentPage();
    const user = this.getUserSession();
    const isLoginPage = currentPage === "login.html";

    console.log(`[AUTH DEBUG] Page: '${currentPage}' | Session:`, user ? `${user.username} (${user.role})` : "NO SESSION");

    // Circuit Breaker: Hentikan jika terjadi pengalihan > 3 kali
    let redirectCount = parseInt(sessionStorage.getItem("_auth_redirect_cnt") || "0", 10);
    if (redirectCount > 3) {
      console.error("[AUTH ERROR] Loop terdeteksi (>3 redirects)! Menghapus sesi...");
      sessionStorage.removeItem("_auth_redirect_cnt");
      this.logout();
      return null;
    }

    // 1. Jika Belum Login
    if (!user) {
      if (!isLoginPage) {
        console.warn("[AUTH] Belum login. Mengalihkan ke login.html");
        sessionStorage.setItem("_auth_redirect_cnt", (redirectCount + 1).toString());
        window.location.replace("login.html");
        return null;
      }
      sessionStorage.removeItem("_auth_redirect_cnt");
      document.documentElement.classList.add("auth-verified");
      return null;
    }

    // Normalisasi Role
    const role = String(user.role || "").toLowerCase().trim();
    const defaultTarget = this.DEFAULT_PAGE[role] || "laporan.html";

    // 2. Jika Sudah Login tapi Membuka login.html
    if (isLoginPage) {
      console.log(`[AUTH] Sudah login sebagai '${role}'. Mengalihkan ke '${defaultTarget}'`);
      sessionStorage.setItem("_auth_redirect_cnt", (redirectCount + 1).toString());
      window.location.replace(defaultTarget);
      return null;
    }

    // 3. Pengecekan Izin Akses Halaman
    const allowedPages = this.ROLE_PERMISSIONS[role];
    let isAllowed = false;

    if (allowedPages === "*") {
      isAllowed = true;
    } else if (Array.isArray(allowedPages)) {
      isAllowed = allowedPages.includes(currentPage);
    }

    // 4. Jika Halaman Tidak Diizinkan
    if (!isAllowed) {
      console.warn(`[AUTH] Role '${role}' DILARANG mengakses '${currentPage}'. Mengalihkan ke '${defaultTarget}'`);
      
      if (defaultTarget === currentPage) {
        console.error("[AUTH ERROR] Target pengalihan sama dengan halaman saat ini. Menghapus sesi...");
        sessionStorage.removeItem("_auth_redirect_cnt");
        this.logout();
        return null;
      }

      sessionStorage.setItem("_auth_redirect_cnt", (redirectCount + 1).toString());
      window.location.replace(defaultTarget);
      return null;
    }

    // 5. Akses Diizinkan
    console.log(`[AUTH SUCCESS] Akses diizinkan untuk '${user.username}' di '${currentPage}'`);
    sessionStorage.removeItem("_auth_redirect_cnt");
    document.documentElement.classList.add("auth-verified");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this._updateNavUI(user));
    } else {
      this._updateNavUI(user);
    }

    return user;
  },

  _updateNavUI(user) {
    const userElement = document.getElementById("nav-user-name");
    if (userElement && user) {
      const displayName = user.nama_guru || user.username || "User";
      const roleName = String(user.role || "").toUpperCase();
      userElement.textContent = `${displayName} (${roleName})`;
    }
  },

  protectPage() { return this.checkAccess(); },
  redirectIfLoggedIn() { return this.checkAccess(); }
};

// Eksekusi Instan Guard
Auth.checkAccess();
