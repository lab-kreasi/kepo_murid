/**
 * js/components.js
 * Injeksi Sidebar UI secara otomatis dengan Penyaringan Hak Akses Role (RBAC)
 */

function renderSidebar(pageOverride = null) {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  // 1. Ambil data user dari sesi Auth
  const user = (typeof Auth !== "undefined" && Auth.getUserSession) ? Auth.getUserSession() : null;
  const role = user && user.role ? String(user.role).toLowerCase().trim() : "guru";

  // 2. Pemetaan Hak Akses (Gunakan dari Auth jika ada, atau fallback)
  const rolePermissions = (typeof Auth !== "undefined" && Auth.ROLE_PERMISSIONS) ? Auth.ROLE_PERMISSIONS : {
    admin: "*",
    piket: [
      "index.html",
      "alpa.html",
      "bolos.html",
      "terlambat.html",
      "input-pelanggaran.html",
      "input-prestasi.html",
      "laporan.html"
    ],
    user: [
      "index.html",
      "input-pelanggaran.html",
      "input-prestasi.html",
      "siswa.html",
      "laporan.html"
    ],
    guru: [
      "index.html",
      "laporan.html"
    ]
  };

  // Helper untuk mengecek apakah role berhak mengakses halaman tertentu
  const canAccess = (pageName) => {
    const allowed = rolePermissions[role] || rolePermissions["guru"];
    if (allowed === "*") return true;
    return Array.isArray(allowed) && allowed.includes(pageName);
  };

  // 3. Deteksi halaman aktif saat ini (Dukungan SPA, Router Override, Hash & Subfolder)
  let currentPath = pageOverride;
  if (!currentPath) {
    const rawPath = window.location.pathname.split("/").pop();
    const rawHash = window.location.hash.replace(/^#\/?/, "");
    currentPath = rawHash || rawPath;
  }

  // Sanitasi string nama halaman
  currentPath = (currentPath || "index.html").toLowerCase().split("?")[0].split("#")[0];
  if (currentPath === "" || currentPath === "/") {
    currentPath = "index.html";
  }

  const getMenuClass = (pageName) => {
    const isActive = currentPath === pageName;
    if (isActive) {
      return "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-md transition";
    }
    return "flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 font-medium transition";
  };

  // 4. Susun Menu Navigasi Berdasarkan Izin Role
  let navContent = "";

  // Dashboard
  if (canAccess("index.html")) {
    navContent += `
      <a href="index.html" class="${getMenuClass('index.html')}">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span>Dashboard</span>
      </a>
    `;
  }

  // Presensi Piket Group (Khusus Admin & Piket)
  const showPiketGroup = canAccess("alpa.html") || canAccess("bolos.html") || canAccess("terlambat.html");
  if (showPiketGroup) {
    navContent += `
      <div class="pt-3">
        <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Presensi Piket</div>
    `;
    if (canAccess("alpa.html")) {
      navContent += `
        <a href="alpa.html" class="${getMenuClass('alpa.html')}">
          <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Input Alpa</span>
        </a>
      `;
    }
    if (canAccess("bolos.html")) {
      navContent += `
        <a href="bolos.html" class="${getMenuClass('bolos.html')}">
          <svg class="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Input Bolos</span>
        </a>
      `;
    }
    if (canAccess("terlambat.html")) {
      navContent += `
        <a href="terlambat.html" class="${getMenuClass('terlambat.html')}">
          <svg class="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Input Terlambat</span>
        </a>
      `;
    }
    navContent += `</div>`;
  }

  // Pelanggaran Group
  const showPelanggaranGroup = canAccess("input-pelanggaran.html") || canAccess("jenis-pelanggaran.html");
  if (showPelanggaranGroup) {
    navContent += `
      <div class="pt-3">
        <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pelanggaran</div>
    `;
    if (canAccess("input-pelanggaran.html")) {
      navContent += `
        <a href="input-pelanggaran.html" class="${getMenuClass('input-pelanggaran.html')}">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span>Input Pelanggaran</span>
        </a>
      `;
    }
    if (canAccess("jenis-pelanggaran.html")) {
      navContent += `
        <a href="jenis-pelanggaran.html" class="${getMenuClass('jenis-pelanggaran.html')}">
          <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          <span>Master Pelanggaran</span>
        </a>
      `;
    }
    navContent += `</div>`;
  }

  // Prestasi Group
  const showPrestasiGroup = canAccess("input-prestasi.html") || canAccess("jenis-prestasi.html");
  if (showPrestasiGroup) {
    navContent += `
      <div class="pt-3">
        <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Prestasi</div>
    `;
    if (canAccess("input-prestasi.html")) {
      navContent += `
        <a href="input-prestasi.html" class="${getMenuClass('input-prestasi.html')}">
          <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          <span>Input Prestasi</span>
        </a>
      `;
    }
    if (canAccess("jenis-prestasi.html")) {
      navContent += `
        <a href="jenis-prestasi.html" class="${getMenuClass('jenis-prestasi.html')}">
          <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          <span>Master Prestasi</span>
        </a>
      `;
    }
    navContent += `</div>`;
  }

  // Master Data & Laporan (Lainnya)
  const showLainnyaGroup = canAccess("siswa.html") || canAccess("laporan.html");
  if (showLainnyaGroup) {
    navContent += `
      <div class="pt-3">
        <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Lainnya</div>
    `;
    if (canAccess("siswa.html")) {
      navContent += `
        <a href="siswa.html" class="${getMenuClass('siswa.html')}">
          <svg class="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span>Data Siswa</span>
        </a>
      `;
    }
    if (canAccess("laporan.html")) {
      navContent += `
        <a href="laporan.html" class="${getMenuClass('laporan.html')}">
          <svg class="w-5 h-5 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span>Laporan</span>
        </a>
      `;
    }
    navContent += `</div>`;
  }

  // Informasi Pengguna Sesi
  const userName = user ? (user.nama_guru || user.username) : "Pengguna";
  const userRoleDisplay = role.toUpperCase();

  // 5. Render Elemen ke DOM
  container.innerHTML = `
    <div class="h-full w-full bg-slate-900 text-slate-300 flex flex-col justify-between shadow-xl overflow-y-auto">
      <div>
        <!-- Logo & Title -->
        <div class="p-6 flex items-center gap-3 border-b border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
            K
          </div>
          <div>
            <h1 class="text-base font-bold text-white leading-tight">KEPO Murid</h1>
            <p class="text-xs text-slate-400">Sistem Kedisiplinan</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-4 space-y-1 text-sm">
          ${navContent}
        </nav>
      </div>

      <!-- User Profile & Logout Button -->
      <div class="p-4 border-t border-slate-800 space-y-3">
        <div class="px-1 flex items-center justify-between">
          <div class="truncate">
            <p id="nav-user-name" class="text-xs font-bold text-slate-200 truncate">${userName}</p>
            <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-blue-400 mt-0.5">${userRoleDisplay}</span>
          </div>
        </div>
        <button onclick="handleLogout()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 font-medium transition text-sm cursor-pointer">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  `;

  // Tangani klik menu untuk memperbarui highlight & navigasi SPA
  container.querySelectorAll("a[href]").forEach(link => {
    link.addEventListener("click", (e) => {
      const targetPage = link.getAttribute("href");

      // Jika menggunakan SPA Router (loadPage)
      if (typeof window.loadPage === "function" && targetPage && !targetPage.startsWith("http")) {
        e.preventDefault(); // Cegah refresh halaman browser
        
        // 1. Panggil router untuk muat konten
        window.loadPage(targetPage);
        
        // 2. Perbarui highlight sidebar secara instan
        renderSidebar(targetPage);
      }

      // Tutup sidebar otomatis pada layar mobile
      const overlay = document.getElementById("sidebar-overlay");
      if (window.innerWidth < 768) {
        container.classList.add("-translate-x-full");
        if (overlay) overlay.classList.add("hidden");
      }
    });
  });
}

function handleLogout() {
  if (typeof Auth !== "undefined" && typeof Auth.logout === "function") {
    Auth.logout();
  } else {
    localStorage.removeItem("kepo_user");
    window.location.href = "login.html";
  }
}

// Eksplisit Ekspor Fungsi ke Window untuk Akses Global / SPA Router
window.renderSidebar = renderSidebar;
window.handleLogout = handleLogout;

// Eksekusi otomatis sesuai status dokumen
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => renderSidebar());
} else {
  renderSidebar();
}