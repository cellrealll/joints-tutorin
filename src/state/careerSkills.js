const q = (prompt, options, correct) => ({ prompt, options, correct });
const skill = (title, courseId, lessons, prerequisites, questions) => ({ title, courseId, lessons, prerequisites, questions });
// Short formative assessments, not professional verification or hiring standards.
export const careerSkills = {
  logic: skill("Programming Logic", "frontend-course", [], [], [
    q("Struktur untuk mengambil keputusan berdasarkan kondisi?", ["if", "Komentar", "Import"], 0),
    q("Berapa hasil 10 % 3?", ["3", "1", "0"], 1),
    q("Apa tujuan debugging?", ["Memperbesar file", "Menghapus variabel", "Menemukan dan memperbaiki kesalahan"], 2),
  ]),
  html: skill("HTML", "frontend-course", [0], [], [
    q("Elemen semantic untuk navigasi utama?", ["div", "nav", "span"], 1),
    q("Atribut gambar yang memberi alternatif teks?", ["alt", "src", "id"], 0),
    q("Cara menghubungkan label dengan input?", ["Warna sama", "Urutan berdekatan", "for pada label sama dengan id input"], 2),
  ]),
  css: skill("CSS", "frontend-course", [0, 1], ["html"], [
    q("Layout dua dimensi baris dan kolom?", ["CSS Grid", "Opacity", "Float saja"], 0),
    q("Aturan CSS berdasarkan ukuran viewport?", ["@font-face", "@media", "@import"], 1),
    q("Apa hasil box-sizing: border-box?", ["Border hilang", "Padding selalu nol", "Width mencakup padding dan border"], 2),
  ]),
  javascript: skill("JavaScript", "frontend-course", [2], ["logic"], [
    q("Array.map() digunakan untuk?", ["Mengubah setiap item menjadi array baru", "Menghapus semua item", "Menunda request"], 0),
    q("Cara menunggu Promise dalam fungsi async?", ["wait", "await", "pause"], 1),
    q("Event yang umum dipakai saat tombol ditekan?", ["resize", "load", "click"], 2),
  ]),
  git: skill("Git", "frontend-course", [], [], [
    q("Perintah menyimpan snapshot perubahan yang sudah di-stage?", ["git commit", "git clone", "git status"], 0),
    q("Mengapa menggunakan branch?", ["Menghapus riwayat", "Mengisolasi pekerjaan fitur", "Menambah ukuran gambar"], 1),
    q("Apa yang dilakukan saat merge conflict?", ["Mengabaikan semua perubahan", "Menghapus repo", "Meninjau dan menyelesaikan bagian yang bertabrakan"], 2),
  ]),
  react: skill("React", "frontend-course", [3, 4], ["javascript"], [
    q("Hook untuk state lokal komponen?", ["useState", "useImport", "useHTML"], 0),
    q("Mengapa list memerlukan key yang stabil?", ["Untuk mengubah warna", "Untuk menjaga identitas item antar-render", "Agar selalu diurutkan"], 1),
    q("Cara memperbarui array di React state?", ["Mutasi array lalu abaikan setter", "Ubah DOM langsung", "Buat array baru dan panggil setter"], 2),
  ]),
  api: skill("API Integration", "frontend-course", [5], ["javascript"], [
    q("Status HTTP yang menunjukkan resource tidak ditemukan?", ["404", "200", "201"], 0),
    q("Apa yang perlu ditangani pada request data?", ["Hanya sukses", "Loading, sukses, dan error", "Hanya warna UI"], 1),
    q("Mengapa API secret tidak ditaruh di frontend publik?", ["Tidak boleh ada string", "Membuat CSS rusak", "Kode client dapat dibaca pengguna"], 2),
  ]),
  testing: skill("Testing", "frontend-course", [6], ["javascript"], [
    q("Tes UI yang bermakna memeriksa?", ["Perilaku pengguna dan hasilnya", "Nama variabel saja", "Jumlah komentar"], 0),
    q("Kapan state error perlu diuji?", ["Tidak pernah", "Saat alur dapat gagal", "Hanya saat deploy"], 1),
    q("Tes regresi membantu?", ["Mengganti desain", "Menaikkan skor otomatis", "Mencegah bug yang sudah diperbaiki kembali"], 2),
  ]),
  http: skill("HTTP & REST", "backend-course", [0], [], [
    q("Metode untuk membaca resource tanpa mengubahnya?", ["GET", "POST", "DELETE"], 0),
    q("Status ketika autentikasi dibutuhkan?", ["201", "401", "200"], 1),
    q("API contract menjelaskan?", ["Warna logo", "Harga laptop", "Format request, response, dan perilaku endpoint"], 2),
  ]),
  node: skill("Node.js", "backend-course", [1, 2], ["logic", "http"], [
    q("Node.js menjalankan JavaScript di?", ["Runtime di luar browser", "CSS selector", "Hanya file gambar"], 0),
    q("Middleware pada server berguna untuk?", ["Mengganti keyboard", "Menangani request sebelum handler berikutnya", "Menghapus database"], 1),
    q("Input pengguna sebaiknya?", ["Selalu dipercaya", "Disimpan tanpa pemeriksaan", "Divalidasi sebelum diproses"], 2),
  ]),
  sql: skill("SQL & Databases", "backend-course", [3], ["logic"], [
    q("Query untuk membaca data?", ["SELECT", "DROP", "DELETE"], 0),
    q("JOIN digunakan untuk?", ["Membuat CSS", "Menggabungkan data antar-tabel", "Menghapus index"], 1),
    q("Cara membantu mencegah SQL injection?", ["Gabungkan string input", "Percaya semua input", "Gunakan parameterized query"], 2),
  ]),
  auth: skill("Authentication", "backend-course", [4], ["http", "node"], [
    q("Authentication menjawab pertanyaan?", ["Siapa pengguna ini?", "Warna apa?", "Berapa lebar layar?"], 0),
    q("Authorization memeriksa?", ["Ukuran font", "Izin akses resource", "Kecepatan mouse"], 1),
    q("Password sebaiknya disimpan sebagai?", ["Teks biasa", "Base64 saja", "Hash password dengan algoritma yang sesuai"], 2),
  ]),
  research: skill("User Research", "uiux-course", [0, 1], [], [
    q("Tujuan riset pengguna adalah?", ["Memahami kebutuhan dan masalah pengguna", "Membenarkan semua asumsi", "Meniru semua kompetitor"], 0),
    q("Pertanyaan interview yang baik biasanya?", ["Menggiring jawaban", "Terbuka dan netral", "Hanya ya/tidak"], 1),
    q("Persona sebaiknya didasarkan pada?", ["Selera pribadi", "Warna favorit tim", "Pola temuan riset"], 2),
  ]),
  flow: skill("User Flows", "uiux-course", [2, 3], ["research"], [
    q("User flow menggambarkan?", ["Langkah pengguna mencapai tujuan", "Daftar warna", "Struktur gaji"], 0),
    q("Wireframe low-fidelity dipakai untuk?", ["Final branding saja", "Menguji struktur dengan cepat", "Mengukur kecepatan internet"], 1),
    q("Information architecture membantu?", ["Menambah dekorasi", "Memilih laptop", "Mengorganisasi informasi agar mudah ditemukan"], 2),
  ]),
  design: skill("UI & Prototyping", "uiux-course", [4], ["flow"], [
    q("Prototype interaktif membantu menguji?", ["Alur dan interaksi", "Kapasitas baterai", "Gaji pengguna"], 0),
    q("Hierarki visual membantu pengguna?", ["Mengabaikan konten", "Mengenali informasi yang lebih penting", "Memperbesar database"], 1),
    q("Kontras teks yang cukup membantu?", ["Menambah animasi", "Mengganti semua warna", "Keterbacaan dan aksesibilitas"], 2),
  ]),
  usability: skill("Usability Testing", "uiux-course", [5], ["design"], [
    q("Tes usability mengamati?", ["Pengguna menjalankan tugas", "Hanya opini desainer", "Jumlah warna"], 0),
    q("Saat pengguna kesulitan, fasilitator sebaiknya?", ["Langsung mengerjakan tugasnya", "Mengamati dan bertanya secara netral", "Menyalahkan pengguna"], 1),
    q("Temuan usability digunakan untuk?", ["Menambah fitur acak", "Menghapus semua riset", "Memprioritaskan perbaikan desain"], 2),
  ]),
  communication: skill("Communication", "data-course", [0, 2, 3, 5], [], [
    q("Presentasi efektif dimulai dengan?", ["Tujuan dan kebutuhan audiens", "Semua detail teknis sekaligus", "Membaca seluruh slide"], 0),
    q("Saat tidak tahu jawaban Q&A?", ["Mengarang jawaban", "Akui dan jelaskan langkah mencari jawabannya", "Mengabaikan penanya"], 1),
    q("Storytelling proyek sebaiknya mencakup?", ["Hanya tools", "Hanya warna", "Masalah, proses, keputusan, dan hasil"], 2),
  ]),
  spreadsheet: skill("Spreadsheets", "backend-course", [], [], [
    q("SUM digunakan untuk?", ["Menjumlahkan nilai", "Mengubah font", "Membuka browser"], 0),
    q("Sebelum analisis dataset, sebaiknya?", ["Hapus semua baris", "Periksa format, duplikat, dan nilai kosong", "Abaikan sumber data"], 1),
    q("Pivot table membantu?", ["Mengedit video", "Menulis CSS", "Meringkas data berdasarkan kategori"], 2),
  ]),
  statistics: skill("Statistics", "backend-course", [], [], [
    q("Median adalah?", ["Nilai tengah data terurut", "Jumlah semua data", "Nilai terbesar"], 0),
    q("Korelasi otomatis membuktikan sebab-akibat?", ["Ya", "Tidak", "Selalu pada dataset besar"], 1),
    q("Outlier sebaiknya?", ["Selalu dihapus", "Selalu diabaikan", "Diperiksa konteks dan pengaruhnya"], 2),
  ]),
  python: skill("Python & Pandas", "backend-course", [], ["logic"], [
    q("Pandas DataFrame menyerupai?", ["Tabel data", "File audio", "CSS stylesheet"], 0),
    q("df.head() biasa dipakai untuk?", ["Menghapus tabel", "Melihat baris awal", "Mengubah password"], 1),
    q("Nilai kosong pada dataset perlu?", ["Dianggap nol selalu", "Dibuang tanpa alasan", "Ditangani sesuai konteks analisis"], 2),
  ]),
  mobile: skill("React Native", "frontend-course", [], ["react"], [
    q("Komponen container dasar React Native?", ["View", "div", "section"], 0),
    q("Expo membantu?", ["Mengganti SQL", "Mengembangkan dan menjalankan aplikasi mobile", "Membuat HTML menjadi database"], 1),
    q("Mengapa aplikasi perlu diuji di perangkat?", ["Agar kode lebih panjang", "Hanya untuk screenshot", "Perilaku layout dan interaksi bisa berbeda"], 2),
  ]),
};

export const careerRequirements = {
  frontend: { logic: 2, html: 3, css: 3, javascript: 3, git: 2, react: 2, api: 2, testing: 2, communication: 2 },
  design: { research: 3, flow: 3, design: 3, usability: 2, communication: 2 },
  backend: { logic: 3, http: 3, node: 3, sql: 3, auth: 2, git: 2, communication: 2 },
  data: { logic: 2, spreadsheet: 3, sql: 3, statistics: 3, python: 2, communication: 3 },
  mobile: { logic: 2, javascript: 3, react: 3, mobile: 2, api: 2, git: 2, testing: 2, communication: 2 },
};
export const milestoneSkills = {
  frontend: { "html-css": ["html", "css"], responsive: ["css"], javascript: ["javascript"], git: ["git"], react: ["react"], api: ["api" ] },
  design: { research: ["research"], persona: ["research"], flow: ["flow"], wireframe: ["flow"], prototype: ["design"], testing: ["usability"] },
  backend: { http: ["http"], node: ["node"], routing: ["node"], database: ["sql"], auth: ["auth"] },
  data: { spreadsheets: ["spreadsheet"], sql: ["sql"], statistics: ["statistics"], python: ["python"] },
  mobile: { javascript: ["javascript"], react: ["react"], native: ["mobile"], api: ["api"] },
};
export const lessonCompetencies = {
  "frontend-course": [["html", "css"], ["css"], ["javascript"], ["react"], ["react"], ["api"], ["testing"], []],
  "backend-course": [["http"], ["node"], ["node"], ["sql"], ["auth"], [], [], []],
  "uiux-course": [["research"], ["research"], ["flow"], ["flow"], ["design"], ["usability"], []],
  "data-course": [["communication"], ["communication"], ["communication"], ["communication"], [], ["communication"], []],
};
export const proficiencyLabels = ["Belum dinilai", "Beginner", "Intermediate", "Advanced"];
