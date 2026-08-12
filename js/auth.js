/**
 * js/auth.js
 * Auth Module - Keamanan, Manajemen Sesi & Anti-Looping System (Server-Side Ready)
 */
const Auth = {
  STORAGE_KEY: "kepo_user",

  // 1. Pemetaan Hak Akses Halaman berdasarkan Role
  ROLE_PERMISSIONS: {
    admin: "*", // Akses ke seluruh halaman
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

  // 2. Halaman tujuan default per role saat login atau mencoba membuka halaman terlarang
  DEFAULT_PAGE: {
    admin: "index.html",
    user: "index.html",
    piket: "input-pelanggaran.html",
    guru: "laporan.html"
  },

  // Simpan data user ke localStorage (Termasuk password untuk re-autentikasi API)
  setUserSession(userData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
  },

  // Ambil & Validasi Ketat Data User dari Storage
  getUserSession() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      
      const user = JSON.parse(raw);
      // Validasi struktur objek sesi: wajib memiliki username dan role
      if (user && typeof user === "object" && user.username && user.role) {
        return user;
      }
    } catch (e) {
      console.error("[Auth] Sesi corrupt/tidak valid:", e);
    }
    return null;
  },

  // Hapus sesi (Logout)
  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem("_auth_redirect_cnt");
    window.location.replace("login.html");
  },

  // Mendapatkan nama file HTML aktif secara presisi (Mendukung Sub-folder & Clean URL)
  getCurrentPage() {
    let path = window.location.pathname.split("?")[0].split("#")[0];
    let lastSegment = path.split("/").filter(Boolean).pop() || "index.html";

    // Daftar nama halaman resmi aplikasi
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

  // Handler Proses Login Form
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
        sessionStorage.removeItem("_auth_redirect_cnt"); // Reset konter pengalihan
        return { status: "success", data: sessionData };
      }
      return res || { status: "error", message: "Username atau password salah!" };
    } catch (err) {
      console.error("[Auth] Login error:", err);
      return { status: "error", message: "Gagal terhubung ke server." };
    }
  },

  /**
   * Central Guard - Proteksi Halaman & Pengalihan Hak Akses (Anti-Loop)
   */
  checkAccess() {
    // A. Circuit Breaker: Cegah Infinite Redirect Loop (Max 3x berturut-turut)
    let redirectCount = parseInt(sessionStorage.getItem("_auth_redirect_cnt") || "0", 10);
    if (redirectCount > 3) {
      console.error("[Auth] Loop pengalihan terdeteksi! Memaksa logout...");
      sessionStorage.removeItem("_auth_redirect_cnt");
      this.logout();
      return null;
    }

    const currentPage = this.getCurrentPage();
    const user = this.getUserSession();
    const isLoginPage = currentPage === "login.html";

    // Kasus 1: Belum Login / Sesi Rusak
    if (!user) {
      if (!isLoginPage) {
        sessionStorage.setItem("_auth_redirect_cnt", (redirectCount + 1).toString());
        window.location.replace("login.html");
        return null;
      }
      // Di halaman login & belum login
      sessionStorage.removeItem("_auth_redirect_cnt");
      document.documentElement.classList.add("auth-verified");
      return null;
    }

    const role = String(user.role || "").toLowerCase().trim();
    const defaultTarget = this.DEFAULT_PAGE[role] || "laporan.html";

    // Kasus 2: Sudah Login tetapi membuka Login.html
    if (isLoginPage) {
      sessionStorage.setItem("_auth_redirect_cnt", (redirectCount + 1).toString());
      window.location.replace(defaultTarget);
      return null;
    }

    // Kasus 3: Verifikasi Hak Akses Role pada Halaman Saat Ini
    const allowedPages = this.ROLE_PERMISSIONS[role];
    let isAllowed = false;

    if (allowedPages === "*") {
      isAllowed = true;
    } else if (Array.isArray(allowedPages)) {
      isAllowed = allowedPages.includes(currentPage);
    }

    // Kasus 4: Halaman TIDAK diizinkan untuk Role saat ini
    if (!isAllowed) {
      // Jika target default sama dengan halaman saat ini, paksa logout untuk menghentikan loop
      if (defaultTarget === currentPage) {
        console.error(`[Auth] Role '${role}' tidak diizinkan membuka '${currentPage}' dan target fallback sama.`);
        sessionStorage.removeItem("_auth_redirect_cnt");
        this.logout();
        return null;
      }

      sessionStorage.setItem("_auth_redirect_cnt", (redirectCount + 1).toString());
      window.location.replace(defaultTarget);
      return null;
    }

    // Lolos Verifikasi: Reset Konter Redirect & Tampilkan Halaman
    sessionStorage.removeItem("_auth_redirect_cnt");
    document.documentElement.classList.add("auth-verified");

    // Tampilkan Nama User pada UI Navbar jika DOM sudah siap
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this._updateNavUI(user));
    } else {
      this._updateNavUI(user);
    }

    return user;
  },

  // Helper Pembaruan UI Navbar
  _updateNavUI(user) {
    const userElement = document.getElementById("nav-user-name");
    if (userElement && user) {
      const displayName = user.nama_guru || user.username || "User";
      const roleName = String(user.role || "").toUpperCase();
      userElement.textContent = `${displayName} (${roleName})`;
    }
  },

  // Alias Metode untuk Kompatibilitas Kode Lama
  protectPage() {
    return this.checkAccess();
  },

  redirectIfLoggedIn() {
    return this.checkAccess();
  }
};

// EKSEKUSI PROTEKSI INSTAN
Auth.checkAccess();
