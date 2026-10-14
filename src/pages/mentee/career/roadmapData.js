const milestone = (id, title, description, skills, icon, courseId, lessons = [], relatedNote = "") =>
  ({ id, title, description, skills, icon, courseId, lessons, relatedNote });

export const careerRoadmaps = [
  {
    id: "frontend", title: "Frontend Developer", icon: "career:code", color: "purple",
    description: "Bangun pengalaman web yang responsif, interaktif, dan nyaman digunakan.",
    tools: ["VS Code", "Git & GitHub", "React", "Browser DevTools"],
    milestones: [
      milestone("html-css", "HTML & CSS Fundamentals", "Susun halaman semantic dan kuasai dasar styling untuk UI web.", ["HTML", "CSS", "Semantic markup"], "career:html", "frontend-course", [0]),
      milestone("responsive", "Responsive Web Design", "Buat layout yang tetap nyaman di desktop, tablet, dan mobile.", ["Flexbox", "CSS Grid", "Media queries"], "career:devices", "frontend-course", [1]),
      milestone("javascript", "JavaScript", "Hidupkan antarmuka dengan logika, DOM, dan event pengguna.", ["JavaScript", "DOM", "Events"], "career:javascript", "frontend-course", [2]),
      milestone("git", "Git & GitHub", "Latih version control: commit, branch, dan pull request untuk proyekmu.", ["Git", "GitHub", "Collaboration"], "career:branch", "frontend-course", [], "Course frontend menjadi tempat latihan. Materi Git khusus belum tersedia; tandai setelah berlatih mandiri."),
      milestone("react", "React", "Bangun komponen reusable, kelola state, dan validasi form.", ["Components", "State", "Forms"], "career:react", "frontend-course", [3, 4]),
      milestone("api", "API Integration", "Hubungkan UI dengan data API dan tangani responsnya.", ["HTTP", "Fetch", "API"], "career:server", "frontend-course", [5]),
      milestone("portfolio", "Portfolio Project", "Selesaikan dashboard responsif dan uji alur interaksinya.", ["UI testing", "Dashboard", "Final project"], "career:folder", "frontend-course", [6, 7]),
      milestone("internship", "Internship Preparation", "Latih storytelling untuk menjelaskan proyek dan keputusan teknismu.", ["Presentation", "Storytelling", "Q&A"], "career:case", "data-course", [0, 3, 5]),
    ],
  },
  {
    id: "design", title: "UI/UX Designer", icon: "career:palette", color: "pink",
    description: "Ubah kebutuhan pengguna menjadi solusi produk yang jelas dan mudah digunakan.",
    tools: ["Figma", "FigJam", "Prototyping", "Research notes"],
    milestones: [
      milestone("research", "User Research", "Pahami masalah dan kebutuhan pengguna sebelum menentukan solusi.", ["Research", "Problem framing"], "career:search", "uiux-course", [0]),
      milestone("persona", "Persona & Journey Mapping", "Petakan pengguna, perjalanan, dan peluang perbaikan pengalaman.", ["Persona", "Journey map"], "career:users", "uiux-course", [1]),
      milestone("flow", "Information Architecture", "Susun struktur informasi dan alur pengguna yang masuk akal.", ["User flow", "Information architecture"], "career:route", "uiux-course", [2]),
      milestone("wireframe", "Wireframing", "Eksplorasi layout dan hierarki melalui wireframe low-fidelity.", ["Wireframe", "Hierarchy"], "career:widget", "uiux-course", [3]),
      milestone("prototype", "UI Design & Prototyping", "Bangun prototype high-fidelity untuk menguji interaksi produk.", ["Figma", "UI design", "Prototype"], "career:palette", "uiux-course", [4]),
      milestone("testing", "Usability Testing", "Uji desain dengan pengguna dan iterasikan temuan utamanya.", ["Usability", "Iteration"], "career:clipboard", "uiux-course", [5]),
      milestone("case-study", "Portfolio Case Study", "Rangkai proses, keputusan desain, dan hasil menjadi case study.", ["Case study", "Design rationale"], "career:folder", "uiux-course", [6]),
      milestone("presentation", "Present Your Work", "Latih presentasi proyek dan jawab pertanyaan tentang desainmu.", ["Presentation", "Q&A"], "career:microphone", "data-course", [3, 5]),
    ],
  },
  {
    id: "backend", title: "Backend Developer", icon: "career:server", color: "blue",
    description: "Bangun layanan API, database, dan sistem autentikasi untuk aplikasi digital.",
    tools: ["Node.js", "Git & GitHub", "Postman", "Database"],
    milestones: [
      milestone("http", "HTTP & REST Fundamentals", "Pahami request, response, dan kontrak API yang konsisten.", ["HTTP", "REST", "API contract"], "career:global", "backend-course", [0]),
      milestone("node", "Node.js Fundamentals", "Siapkan server dan pahami alur aplikasi backend.", ["Node.js", "Server"], "career:node", "backend-course", [1]),
      milestone("routing", "Routing & Validation", "Pisahkan controller dan validasi input untuk endpoint yang jelas.", ["Routing", "Controllers", "Validation"], "career:branch", "backend-course", [2]),
      milestone("database", "Database Design", "Rancang schema dan query sesuai kebutuhan aplikasimu.", ["Schema", "Queries", "Data modeling"], "career:database", "backend-course", [3]),
      milestone("auth", "Authentication & Authorization", "Lindungi akses pengguna dan resource aplikasi.", ["Authentication", "Permissions"], "career:shield", "backend-course", [4]),
      milestone("reliability", "Error Handling & API Testing", "Tangani kegagalan dan verifikasi perilaku endpoint.", ["Logging", "Testing", "Postman"], "career:bug", "backend-course", [5, 6]),
      milestone("project", "Backend Portfolio Project", "Selesaikan API dengan auth, database, dan dokumentasi endpoint.", ["REST API", "Documentation", "Final project"], "career:folder", "backend-course", [7]),
      milestone("interview", "Technical Presentation", "Latih menjelaskan arsitektur dan tradeoff proyek backend.", ["Storytelling", "Presentation", "Q&A"], "career:case", "data-course", [0, 3, 5]),
    ],
  },
  {
    id: "data", title: "Data Analyst", icon: "career:chart", color: "green",
    description: "Latih fondasi pengolahan data dan komunikasi insight melalui course yang tersedia.",
    tools: ["Spreadsheets", "SQL", "Python", "Data visualization"],
    milestones: [
      milestone("spreadsheets", "Spreadsheet Fundamentals", "Latih formula, filter, dan pembersihan dataset sederhana.", ["Spreadsheets", "Data cleaning"], "career:document", "backend-course", [], "Course terkait membahas dasar data. Spreadsheet perlu latihan mandiri; belum ada course khusus."),
      milestone("sql", "Database & SQL Practice", "Pelajari schema dan query, lalu latih SELECT, JOIN, dan agregasi.", ["SQL", "Database", "Queries"], "career:database", "backend-course", [3]),
      milestone("statistics", "Statistics Fundamentals", "Latih statistik deskriptif dan cara membaca variasi data.", ["Mean & median", "Distributions"], "career:chart", "backend-course", [], "Statistik belum tersedia sebagai course. Gunakan proyek data sebagai konteks latihan mandiri."),
      milestone("python", "Python for Analysis", "Latih membaca, membersihkan, dan merangkum dataset dengan Python.", ["Python", "Pandas", "Data cleaning"], "career:python", "backend-course", [], "Course backend memberi konteks pengolahan data; Python dan Pandas perlu latihan mandiri."),
      milestone("visualization", "Data Visualization", "Pilih grafik yang tepat dan tampilkan insight secara jelas.", ["Charts", "Dashboards"], "career:chart", "frontend-course", [], "Course frontend terkait pembuatan dashboard. Visualisasi data perlu latihan tambahan."),
      milestone("storytelling", "Data Storytelling", "Ubah temuan menjadi cerita yang relevan untuk audiens.", ["Storytelling", "Presentation"], "career:microphone", "data-course", [0, 2, 3]),
      milestone("project", "Analysis Portfolio Project", "Dokumentasikan pertanyaan, analisis, visualisasi, dan kesimpulanmu.", ["Analysis", "Case study"], "career:folder", "data-course", [], "Gunakan course komunikasi untuk mempresentasikan hasil. Proyek analisis dikerjakan mandiri."),
      milestone("interview", "Present Your Insights", "Latih menjawab pertanyaan dan mempertahankan kesimpulan analisis.", ["Q&A", "Professional communication"], "career:case", "data-course", [5]),
    ],
  },
  {
    id: "mobile", title: "Mobile Developer", icon: "career:mobile", color: "orange",
    description: "Bangun fondasi UI dan API, lalu praktikkan pengembangan aplikasi mobile.",
    tools: ["React Native", "Expo", "Git & GitHub", "Device emulator"],
    milestones: [
      milestone("javascript", "JavaScript Fundamentals", "Kuasai logika dan event sebagai fondasi aplikasi berbasis JavaScript.", ["JavaScript", "Events"], "career:javascript", "frontend-course", [2]),
      milestone("react", "React Fundamentals", "Pahami komponen, props, state, dan form sebelum beralih ke mobile.", ["React", "Components", "State"], "career:react", "frontend-course", [3, 4]),
      milestone("native", "React Native & Expo", "Siapkan proyek mobile dan kenali komponen native.", ["React Native", "Expo"], "career:mobile", "frontend-course", [], "Course React web menjadi fondasi terkait. React Native dan Expo perlu latihan mandiri."),
      milestone("navigation", "Mobile Navigation", "Latih perpindahan layar, parameter, dan alur navigasi aplikasi.", ["Navigation", "Screen flow"], "career:route", "frontend-course", [], "Navigasi native belum tersedia di katalog; lanjutkan dengan latihan mandiri."),
      milestone("api", "API Integration", "Pelajari pola request data untuk digunakan di aplikasi mobile.", ["HTTP", "API", "Async data"], "career:server", "frontend-course", [5]),
      milestone("testing", "Device Testing", "Uji layout, interaksi, dan kegagalan pada perangkat atau emulator.", ["Device testing", "Debugging"], "career:bug", "frontend-course", [], "Course frontend terkait pengujian UI. Pengujian perangkat mobile perlu praktik tambahan."),
      milestone("project", "Mobile Portfolio Project", "Buat aplikasi dengan beberapa layar, data API, dan dokumentasi.", ["Mobile app", "Final project"], "career:folder", "frontend-course", [], "Gunakan pola proyek frontend sebagai referensi; proyek mobile dikerjakan mandiri."),
      milestone("presentation", "Project Presentation", "Jelaskan demo aplikasi, keputusan teknis, dan proses belajarmu.", ["Presentation", "Q&A"], "career:case", "data-course", [3, 5]),
    ],
  },
];

export function careerFor(id) {
  return careerRoadmaps.find((career) => career.id === id) || careerRoadmaps[0];
}
