/**
 * Auth Module - Keamanan & Manajemen Sesi Berdasarkan Role
 */
const Auth = {
  // Pemetaan Hak Akses Halaman berdasarkan Role
  ROLE_PERMISSIONS: {
    admin: "*", // Akses ke seluruh halaman
    user: [
      "index.html",
      "input-pelanggaran.html",
      "input-prestasi.html",
      "siswa.html",
      "laporan.html"
    ],
    piket: [
      "index.html",
      "input-pelanggaran.html",
      "input-prestasi.html",
      "laporan.html"
    ],
    guru: [
      "index.html",
      "laporan.html"
    ]
  },

  // Halaman tujuan default per role saat login atau mencoba membuka halaman terlarang
  DEFAULT_PAGE: {
    admin: "index.html",
    user: "input-pelanggaran.html",
    piket: "input-pelanggaran.html",
    guru: "laporan.html"
  },

  // Simpan data user ke localStorage
  setUserSession(userData) {
    localStorage.setItem("kepo_user", JSON.stringify(userData));
  },

  // Ambil data user dari localStorage
  getUserSession() {
    const user = localStorage.getItem("kepo_user");
    return user ? JSON.parse(user) : null;
  },

  // Hapus sesi (Logout)
  logout() {
    localStorage.removeItem("kepo_user");
    window.location.href = "login.html";
  },

  // Mendapatkan nama file halaman saat ini dengan bersih
  // Mendapatkan nama file HTML aktif secara presisi (Mendukung Sub-folder & Clean URL)
    getCurrentPage() {
      let path = window.location.pathname.split("?")[0].split("#")[0];
      
      // Jika path berakhiran '/', pasti membuka index.html
      if (path.endsWith("/")) return "index.html";
  
      let lastSegment = path.split("/").filter(Boolean).pop() || "index.html";
  
      // Daftar nama halaman resmi aplikasi
      const validPages = [
        "index", "login", "siswa", "laporan", 
        "input-pelanggaran", "input-prestasi", 
        "jenis-pelanggaran", "jenis-prestasi"
      ];
  
      // Bersihkan ekstensi .html jika ada
      let cleanName = lastSegment.replace(/\.html$/i, "").toLowerCase();
  
      // Jika segmen terakhir adalah halaman resmi, kembalikan nama dengan ekstensi .html
      if (validPages.includes(cleanName)) {
        return cleanName + ".html";
      }
  
      // Jika segmen terakhir adalah nama folder (misal: 'kepo_murid'), anggap index.html
      return "index.html";
    },

  // Proteksi Halaman & Verifikasi Hak Akses Role
  protectPage() {
    const user = this.getUserSession();
    
    // 1. Jika belum login, tendang ke login.html
    if (!user) {
      window.location.href = "login.html";
      return null;
    }

    const role = (user.role || "").toLowerCase().trim();
    const currentPage = this.getCurrentPage();
    const allowedPages = this.ROLE_PERMISSIONS[role];

    // 2. Cek Hak Akses Halaman berdasarkan Role
    if (allowedPages !== "*") {
      const isAllowed = Array.isArray(allowedPages) && allowedPages.includes(currentPage);
      
      if (!isAllowed) {
        const redirectTarget = this.DEFAULT_PAGE[role] || "laporan.html";
        alert(`Akses Ditolak: Akun '${user.nama_guru || user.username}' (${user.role}) tidak memiliki akses ke halaman '${currentPage}'.`);
        window.location.href = redirectTarget;
        return null;
      }
    }

    // 3. Tampilkan nama user & role jika elemen UI tersedia
    const userElement = document.getElementById("nav-user-name");
    if (userElement) {
      userElement.textContent = `${user.nama_guru} (${user.role.toUpperCase()})`;
    }

    return user;
  },

  // Proteksi Halaman Login (Jika sudah login, lempar ke halaman default role)
  redirectIfLoggedIn() {
    const user = this.getUserSession();
    if (user) {
      const role = (user.role || "").toLowerCase().trim();
      const targetPage = this.DEFAULT_PAGE[role] || "index.html";
      window.location.href = targetPage;
    }
  },

  // Handler Proses Login Form
  async handleLogin(username, password) {
    if (!username || !password) {
      return { status: "error", message: "Username dan Password wajib diisi!" };
    }

    const res = await ApiService.login(username, password);
    if (res.status === "success") {
      this.setUserSession(res.data);
    }
    return res;
  }
};

// EKSEKUSI PROTEKSI OTOMATIS SAAT DOM SELESAI DIMUAT
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = Auth.getCurrentPage();
  if (currentPage === "login.html") {
    Auth.redirectIfLoggedIn();
  } else {
    Auth.protectPage();
  }
});
