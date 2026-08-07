async function loadDataSiswa() {
  const response = await ApiService.getSiswa("2025-2026", "VII.1");
  if (response.status === "success") {
    console.log("Data Siswa:", response.data);
  } else {
    alert(response.message);
  }
}
