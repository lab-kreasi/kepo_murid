/**
 * Auth Module - Keamanan & Manajemen Sesi
 */
const Auth = {
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

  // Proteksi Halaman Utama (Panggil di halaman selain login.html)
  protectPage() {
    const user = this.getUserSession();
    if (!user) {
      window.location.href = "login.html";
      return null;
    }

    // Tampilkan nama user login jika elemennya ada di HTML
    const userElement = document.getElementById("nav-user-name");
    if (userElement) {
      userElement.textContent = `${user.nama_guru} (${user.role})`;
    }

    return user;
  },

  // Proteksi Halaman Login (Jika sudah login, langsung lempar ke index.html)
  redirectIfLoggedIn() {
    const user = this.getUserSession();
    if (user) {
      window.location.href = "index.html";
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
