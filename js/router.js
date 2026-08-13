/**
 * js/router.js
 * Single Page Application (SPA) Router & Dynamic Script Inserter
 */
(() => {
  function initRouter() {
    // Intersepsi Klik Navigasi / Link internal
    document.body.addEventListener("click", async (e) => {
      const link = e.target.closest("a");

      if (!link) return;
      const href = link.getAttribute("href");

      // Abaikan link luar, anchor kosong, atau fungsi JavaScript
      if (!href || href === "#" || href.startsWith("http") || href.startsWith("javascript:")) return;

      // Abaikan halaman authentication / logout
      if (href === "login.html" || href.includes("logout")) return;

      e.preventDefault();

      await loadPage(href);
      window.history.pushState({ path: href }, "", href);
    });

    // Tangani Navigasi Tombol Back/Forward Browser
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.path) {
        loadPage(e.state.path);
      } else {
        loadPage("index.html");
      }
    });

    // Sinkronkan highlight sidebar saat pertama kali dimuat/di-refresh
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    if (typeof window.renderSidebar === "function") {
      window.renderSidebar(currentPath);
    }
  }

  async function loadPage(pageUrl) {
    const mainContent = document.querySelector("main");
    if (!mainContent) return;

    // Sanitasi nama halaman (ambil nama file tanpa query string & path subfolder)
    const cleanPageName = pageUrl.split("/").pop().split("?")[0].split("#")[0] || "index.html";

    try {
      // Tampilkan indikator Loading
      mainContent.innerHTML = `
        <div class="flex justify-center items-center h-64 w-full">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      `;

      // Fetch konten HTML halaman target
      const response = await fetch(pageUrl);
      if (!response.ok) throw new Error("Halaman tidak ditemukan (404)");
      const htmlText = await response.text();

      // Parsing HTML response
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      // Update Judul Halaman / Tab Browser jika ada
      if (doc.title) {
        document.title = doc.title;
      }

      // Injeksi konten baru ke tag <main>
      const newMain = doc.querySelector("main");
      if (newMain) {
        mainContent.innerHTML = newMain.innerHTML;
      } else {
        mainContent.innerHTML = htmlText;
      }

      // 1. Muat Script JS khusus halaman
      loadPageSpecificScript(cleanPageName);

      // 2. PERBAIKAN: Panggil pembaruan highlight sidebar secara otomatis
      if (typeof window.renderSidebar === "function") {
        window.renderSidebar(cleanPageName);
      }

      // 3. Reset posisi scroll ke paling atas
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      console.error("Router Error:", error);
      mainContent.innerHTML = `
        <div class="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 m-4">
          <h2 class="font-bold text-lg">Gagal Memuat Halaman</h2>
          <p class="text-sm">Silakan periksa koneksi internet atau muat ulang halaman (F5).</p>
        </div>`;
    }
  }

  function loadPageSpecificScript(pageUrl) {
    const oldScript = document.getElementById("dynamic-page-script");
    if (oldScript) oldScript.remove();

    let scriptSrc = "";

    if (pageUrl.includes("index.html") || pageUrl === "/" || pageUrl === "") scriptSrc = "js/dashboard.js";
    else if (pageUrl.includes("alpa.html")) scriptSrc = "js/alpa.js";
    else if (pageUrl.includes("bolos.html")) scriptSrc = "js/bolos.js";
    else if (pageUrl.includes("terlambat.html")) scriptSrc = "js/terlambat.js";
    else if (pageUrl.includes("siswa.html")) scriptSrc = "js/siswa.js";
    else if (pageUrl.includes("input-pelanggaran")) scriptSrc = "js/input.js";
    else if (pageUrl.includes("input-prestasi")) scriptSrc = "js/input-prestasi.js";
    else if (pageUrl.includes("jenis-pelanggaran")) scriptSrc = "js/pelanggaran.js";
    else if (pageUrl.includes("jenis-prestasi")) scriptSrc = "js/prestasi.js";
    else if (pageUrl.includes("laporan.html")) scriptSrc = "js/laporan.js";

    if (scriptSrc) {
      const script = document.createElement("script");
      script.src = `${scriptSrc}?t=${Date.now()}`;
      script.id = "dynamic-page-script";
      document.body.appendChild(script);
    }
  }

  // Ekspor fungsi ke ruang global
  window.loadPage = loadPage;
  window.loadPageSpecificScript = loadPageSpecificScript;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouter);
  } else {
    initRouter();
  }
})();