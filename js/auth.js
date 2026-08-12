/**
 * js/auth.js
 * Auth Module - Keamanan & Manajemen Sesi Berdasarkan Role (Server-Side Ready)
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

  // Ambil data user dari localStorage / sessionStorage
  getUserSession() {
    try {
      const user = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("[Auth] Error parsing session:", e);
      return null;
    }
  },

  // Hapus sesi (Logout)
  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
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
        // Gabungkan data response dengan password asli untuk autentikasi server-side API berikutnya
        const sessionData = {
          ...res.data,
          username: res.data.username || username,
          role: String(res.data.role || "guru").toLowerCase().trim(),
          password: password
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

  /**
   * Central Guard - Proteksi Halaman & Pengalihan Hak Akses Akseleratif
   */
  checkAccess() {
    const currentPage = this.getCurrentPage();
    const user = this.getUserSession();
    const isLoginPage = currentPage === "login.html";

    // Kasus 1: Akses Halaman Login
    if (isLoginPage) {
      if (user) {
        const role = (user.role || "").toLowerCase().trim();
        const targetPage = this.DEFAULT_PAGE[role] || "laporan.html";
        window.location.replace(targetPage);
        return null;
      }
      // Buka halaman login jika belum login
      document.documentElement.classList.add("auth-verified");
      return null;
    }

    // Kasus 2: Belum Login tetapi membuka Halaman Terproteksi
    if (!user) {
      window.location.replace("login.html");
      return null;
    }

    // Kasus 3: Verifikasi Hak Akses Role pada Halaman Saat Ini
    const role = (user.role || "").toLowerCase().trim();
    const allowedPages = this.ROLE_PERMISSIONS[role];

    let isAllowed = false;
    if (allowedPages === "*") {
      isAllowed = true;
    } else if (Array.isArray(allowedPages)) {
      isAllowed = allowedPages.includes(currentPage);
    }

    // Jika Tidak Berhak Akses: Lempar ke Halaman Default Role
    if (!isAllowed) {
      const redirectTarget = this.DEFAULT_PAGE[role] || "laporan.html";
      
      // Mencegah Infinite Loop jika Target Sama dengan Halaman Saat Ini
      if (redirectTarget !== currentPage) {
        window.location.replace(redirectTarget);
      } else {
        window.location.replace("laporan.html");
      }
      return null;
    }

    // Jika Lolos Verifikasi: Buka Tampilan (Anti-Flicker)
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
      const roleName = (user.role || "").toUpperCase();
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

// EKSEKUSI PROTEKSI INSTAN (Mencegah Layar Berkedip / Flicker)
Auth.checkAccess();
