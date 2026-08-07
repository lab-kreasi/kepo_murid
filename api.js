// URL Web App GAS setelah di-deploy
const API_URL = "https://script.google.com/macros/s/AKfycbz0DLwX_mSpg6HT_pRom8RUJCCLfxAYKfSipySe_yzRWndKWGZ_aNhIaYeK__iG_m5z/exec";

// Module API Frontend
const ApiService = {
  
  // Method GET Data
  async get(action, params = {}) {
    const queryParams = new URLSearchParams({ action, ...params }).toString();
    try {
      const response = await fetch(`${API_URL}?${queryParams}`);
      return await response.json();
    } catch (err) {
      console.error("API GET Error:", err);
      return { status: "error", message: err.message };
    }
  },

  // Method POST Data
  async post(action, payload = {}) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Gunakan text/plain untuk menghindari browser CORS pre-flight block pada Apps Script
        body: JSON.stringify({ action, data: payload })
      });
      return await response.json();
    } catch (err) {
      console.error("API POST Error:", err);
      return { status: "error", message: err.message };
    }
  }
};
