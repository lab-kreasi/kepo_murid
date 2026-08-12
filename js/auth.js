/**
 * js/auth.js
 * Auth Module - Keamanan, Hak Akses Role, & Manajemen Sesi
 */
const Auth = {
  STORAGE_KEY: "kepo_user",

  normalizeRole(rawRole) {
    if (!rawRole) return "guru";
    const role = String(rawRole).toLowerCase().trim();
    if (["admin", "administrator", "superadmin", "utama"].includes(role)) return "admin";
    if (["user", "staf", "staff", "operator"].includes(role)) return "user";
    if (["piket", "petugas"].includes(role)) return "piket";
    return "guru";
  },

  ROLE_PERMISSIONS: {
    admin: "*",
    user: "*",
    piket: [
      "index.html",
      "input-pelanggaran.html",
      "input-prestasi.html",
      "laporan.html",
      "siswa.html"
    ],
    guru: [
      "index.html",
      "laporan.html"
    ]
  },

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
      if (user && typeof user === "object" && (user.username || user.nama_guru || user.id)) {
        return user;
      }
    } catch (e) {
      console.error("[Auth] Sesi corrupt:", e);
    }
    return null;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    window.location.replace("login.html");
  },

  getCurrentPage() {
    let path = window.location.pathname.split("?")[0].split("#")[0];
    let lastSegment = path.split("/").filter(Boolean).pop() || "index.html";
    if (!lastSegment.endsWith(".html")) {
      lastSegment += ".html";
    }
    return lastSegment.toLowerCase();
  },

  // Helper untuk Memperbarui UI Navigasi (Mengatasi TypeError: _updateNavUI)
  _updateNavUI(user) {
    if (!user) return;
    
    const userNameEl = document.getElementById("nav-user-name") || document.getElementById("user-name");
    if (userNameEl) {
      userNameEl.textContent = user.nama_guru || user.nama || user.username || "Pengguna";
    }

    const userRoleEl = document.getElementById("nav-user-role") || document.getElementById("user-role");
    if (userRoleEl) {
      userRoleEl.textContent = (user.role || "Guru").toUpperCase();
    }
  },

  async handleLogin(username, password) {
    if (!username || !password) {
      return { status: "error", message: "Username dan Password wajib diisi!" };
    }

    try {
      const res = await ApiService.login(username, password);
      if (res && res.status === "success" && res.data) {
        // Menyimpan password ke sesi agar otomatis dikirim pada request API berikutnya
        const sessionData = {
          ...res.data,
          username: res.data.username || username,
          password: password, 
          role: res.data.role || "guru"
        };

        this.setUserSession(sessionData);
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

    // 1. Jika Belum Login
    if (!user) {
      if (!isLoginPage) {
        window.location.replace("login.html");
        return null;
      }
      document.documentElement.classList.add("auth-verified");
      return null;
    }

    const role = this.normalizeRole(user.role);
    const defaultTarget = this.DEFAULT_PAGE[role] || "index.html";

    // 2. Jika Sudah Login tapi Membuka login.html
    if (isLoginPage) {
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

    // 4. Jika Halaman Dilarang untuk Role Tersebut
    if (!isAllowed) {
      console.warn(`[AUTH] Role '${role}' dilarang mengakses '${currentPage}'. Melempar ke '${defaultTarget}'`);
      if (currentPage !== defaultTarget) {
        window.location.replace(defaultTarget);
      }
      return null;
    }

    // 5. Akses Diizinkan
    document.documentElement.classList.add("auth-verified");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this._updateNavUI(user));
    } else {
      this._updateNavUI(user);
    }

    return user;
  }
};

// Jalankan Pengecekan Akses Otomatis
Auth.checkAccess();
