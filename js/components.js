/**
 * Auto Load & Highlight Toolbar Component
 */
async function loadToolbar() {
  const container = document.getElementById("toolbar-container");
  if (!container) return;

  try {
    const response = await fetch("toolbar.html");
    if (!response.ok) throw new Error("Gagal memuat komponen toolbar.");
    
    const htmlText = await response.text();
    container.innerHTML = htmlText;

    // Sorot menu yang sedang aktif secara otomatis
    highlightActiveMenu();

    // Tampilkan nama user login jika fungsi Auth tersedia
    if (typeof Auth !== "undefined" && typeof Auth.initNavUser === "function") {
      Auth.initNavUser();
    }
  } catch (error) {
    console.error("Toolbar Error:", error);
  }
}

function highlightActiveMenu() {
  // Ambil nama file dari URL saat ini (default: index.html)
  let currentPage = window.location.pathname.split("/").pop();
  if (!currentPage || currentPage === "") currentPage = "index.html";

  // Cari link menu yang memiliki data-page sesuai URL
  const links = document.querySelectorAll("[data-page]");

  links.forEach(link => {
    if (link.getAttribute("data-page") === currentPage) {
      link.classList.add("active");

      // Jika link berada dalam dropdown, jadikan tombol dropdown utama ikut active
      const dropdownParent = link.closest(".dropdown");
      if (dropdownParent) {
        const toggleBtn = dropdownParent.querySelector(".dropdown-toggle");
        if (toggleBtn) toggleBtn.classList.add("active");
      }
    }
  });
}

// Jalankan otomatis saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", loadToolbar);
