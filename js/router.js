(() => {
  function initRouter() {
    document.body.addEventListener("click", async (e) => {
      const link = e.target.closest("a");
      
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.startsWith("http")) return;
      
      if (href === "login.html" || href.includes("logout")) return;

      e.preventDefault(); 

      await loadPage(href);
      window.history.pushState({ path: href }, "", href); 
    });

    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.path) {
        loadPage(e.state.path);
      } else {
        loadPage("index.html");
      }
    });
  }

  async function loadPage(pageUrl) {
    const mainContent = document.querySelector("main");
    if (!mainContent) return;
    
    try {
      mainContent.innerHTML = `
        <div class="flex justify-center items-center h-64 w-full">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      `;

      const response = await fetch(pageUrl);
      if (!response.ok) throw new Error("Halaman tidak ditemukan (404)");
      const htmlText = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      const newMain = doc.querySelector("main");

      if (newMain) {
        mainContent.innerHTML = newMain.innerHTML;
        loadPageSpecificScript(pageUrl);
      }
    } catch (error) {
      console.error("Router Error:", error);
      mainContent.innerHTML = `
        <div class="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
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

  window.loadPage = loadPage;
  window.loadPageSpecificScript = loadPageSpecificScript;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouter);
  } else {
    initRouter();
  }
})();