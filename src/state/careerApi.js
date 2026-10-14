export function careerAccountAvailable() {
  try { return !!import.meta.env.VITE_API_URL && !!JSON.parse(localStorage.getItem("tutorin-auth"))?.token; } catch { return false; }
}
// The existing Express JWT authenticates this endpoint; browser demos stay local.
export async function saveCareerToAccount(state, target) {
  if (!careerAccountAvailable()) throw new Error("Belum ada sesi akun backend yang terhubung.");
  const auth = JSON.parse(localStorage.getItem("tutorin-auth"));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/career/profile`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ version: 1, target, state }), signal: controller.signal,
    });
    if (!response.ok) throw new Error(response.status === 401 ? "Sesi akun sudah berakhir. Masuk kembali." : "Data belum tersimpan ke akun. Coba kembali.");
    return await response.json();
  } finally { clearTimeout(timer); }
}
export async function loadCareerFromAccount() {
  if (!careerAccountAvailable()) throw new Error("Belum ada sesi akun backend yang terhubung.");
  const auth = JSON.parse(localStorage.getItem("tutorin-auth"));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/career/profile`, {
      headers: { Authorization: `Bearer ${auth.token}` }, signal: controller.signal,
    });
    if (!response.ok) throw new Error("Data akun belum dapat dimuat. Periksa sesi akun dan koneksi.");
    return (await response.json()).data;
  } finally { clearTimeout(timer); }
}
