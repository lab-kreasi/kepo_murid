/**
 * js/components.js
 * Injeksi Sidebar UI secara otomatis
 */

function renderSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  // Deteksi halaman aktif
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  const getMenuClass = (pageName) => {
    const isActive = currentPath === pageName || (pageName === 'index.html' && currentPath === '');
    if (isActive) {
      return "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-md transition";
    }
    return "flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white text-slate-300 font-medium transition";
  };

  container.innerHTML = `
    <div class="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between fixed left-0 top-0 z-50 border-r border-slate-800 shadow-xl">
      <div>
        <!-- Logo & Title -->
        <div class="p-6 flex items-center gap-3 border-b border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
            K
          </div>
          <div>
            <h1 class="text-base font-bold text-white leading-tight">KEPO Murid</h1>
            <p class="text-xs text-slate-400">Sistem Kedisiplinan</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-4 space-y-1 text-sm">
          <!-- Dashboard -->
          <a href="index.html" class="${getMenuClass('index.html')}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>Dashboard</span>
          </a>

          <!-- Pelanggaran Group -->
          <div class="pt-3">
            <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pelanggaran</div>
            <a href="input-pelanggaran.html" class="${getMenuClass('input-pelanggaran.html')}">
              <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>Input Pelanggaran</span>
            </a>
            <a href="jenis-pelanggaran.html" class="${getMenuClass('jenis-pelanggaran.html')}">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              <span>Master Pelanggaran</span>
            </a>
          </div>

          <!-- Prestasi Group -->
          <div class="pt-3">
            <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Prestasi</div>
            <a href="input-prestasi.html" class="${getMenuClass('input-prestasi.html')}">
              <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              <span>Input Prestasi</span>
            </a>
            <a href="jenis-prestasi.html" class="${getMenuClass('jenis-prestasi.html')}">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              <span>Master Prestasi</span>
            </a>
          </div>

          <!-- Master Data & Laporan -->
          <div class="pt-3">
            <div class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Lainnya</div>
            <a href="siswa.html" class="${getMenuClass('siswa.html')}">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span>Data Siswa</span>
            </a>
            <a href="laporan.html" class="${getMenuClass('laporan.html')}">
              <svg class="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>Laporan</span>
            </a>
          </div>
        </nav>
      </div>

      <!-- Logout Button -->
      <div class="p-4 border-t border-slate-800">
        <button onclick="handleLogout()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 font-medium transition text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  `;
}

function handleLogout() {
  if (typeof Auth !== "undefined" && typeof Auth.logout === "function") {
    Auth.logout();
  } else {
    window.location.href = "login.html";
  }
}

// Menjamin renderSidebar dipanggil terlepas dari waktu muat DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderSidebar);
} else {
  renderSidebar();
}
