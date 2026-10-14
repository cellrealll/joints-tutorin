import crosswordGenerator from "crossword-layout-generator";

const choice = (prompt, options, correct, explanation) => ({ type: "choice", prompt, options, correct, explanation });
const short = (prompt, correct, explanation) => ({ type: "short", prompt, correct, explanation });
const truth = (prompt, correct, explanation) => ({ type: "choice", prompt, options: ["Benar", "Salah"], correct: correct ? 0 : 1, explanation });

export const courses = {
  algebra: {
    title: "Matematika - Aljabar", topic: "Persamaan dan konsep dasar",
    pre: [
      choice("Jika 3x + 5 = 20, berapakah nilai x?", ["3", "5", "7", "10"], 1, "Kurangi kedua ruas dengan 5, lalu bagi 3: x = 5."),
      choice("Bentuk sederhana dari 2x + 3x adalah ...", ["5x", "6x", "5x kuadrat", "x"], 0, "Suku sejenis dijumlahkan koefisiennya: 2 + 3 = 5."),
      choice("Jika x = 4, nilai 2x - 1 adalah ...", ["5", "6", "7", "8"], 2, "2(4) - 1 = 7."),
      choice("Koefisien x pada 7x + 2 adalah ...", ["2", "7", "9", "x"], 1, "Koefisien adalah bilangan yang mengalikan variabel."),
      choice("Hasil 3(x + 2) adalah ...", ["3x + 2", "x + 6", "3x + 6", "6x"], 2, "Sifat distributif: 3 dikalikan ke setiap suku."),
      choice("Penyelesaian 2x = 14 adalah ...", ["7", "12", "16", "28"], 0, "Bagi kedua ruas dengan 2."),
      choice("Konstanta pada 5x - 8 adalah ...", ["5", "x", "-8", "8x"], 2, "Konstanta tidak mengandung variabel; tandanya ikut dihitung."),
      choice("Jika x + y = 9 dan x = 4, maka y = ...", ["4", "5", "9", "13"], 1, "y = 9 - 4 = 5."),
      choice("Hasil 4x - x adalah ...", ["4", "5x", "3x", "3"], 2, "Koefisien x adalah 1, sehingga 4x - 1x = 3x."),
      choice("Pasangan mana yang memenuhi x + y = 5?", ["(1, 1)", "(2, 2)", "(2, 3)", "(5, 5)"], 2, "2 + 3 = 5."),
    ],
    words: [["ALJABAR", "Cabang matematika yang menggunakan simbol untuk mewakili bilangan."], ["VARIABEL", "Simbol yang nilainya dapat berubah."], ["SKALAR", "Besaran yang hanya mempunyai nilai, tanpa arah."], ["LINEAR", "Persamaan dengan pangkat tertinggi variabel satu."], ["MATRIKS", "Susunan bilangan dalam baris dan kolom."]],
    post: [choice("Jika 2x + 4 = 16, nilai x adalah ...", ["4", "6", "8", "10"], 1, "2x = 12, maka x = 6."), truth("Bentuk 3x + 2x dapat disederhanakan menjadi 5x.", true, "Keduanya suku sejenis, jadi koefisiennya dijumlahkan."), short("Jika x + 7 = 12, berapa nilai x?", "5", "Kurangi kedua ruas dengan 7: x = 5.")],
  },
  physics: {
    title: "Fisika", topic: "Gerak dan gaya",
    pre: [
      choice("Satuan SI untuk gaya adalah ...", ["Joule", "Newton", "Watt", "Meter"], 1, "Gaya diukur dalam newton (N)."),
      choice("Benda menempuh 100 m dalam 20 s. Kelajuannya ...", ["2 m/s", "5 m/s", "20 m/s", "50 m/s"], 1, "Kelajuan = jarak / waktu = 100 / 20 = 5 m/s."),
      choice("Rumus hukum II Newton adalah ...", ["F = m/a", "F = ma", "F = a/m", "F = m + a"], 1, "Resultan gaya sama dengan massa dikali percepatan."),
      choice("Satuan SI untuk massa adalah ...", ["Newton", "Liter", "Kilogram", "Watt"], 2, "Massa diukur dalam kilogram (kg)."),
      choice("Besaran yang mempunyai nilai dan arah adalah ...", ["Skalar", "Vektor", "Konstanta", "Waktu"], 1, "Vektor memiliki nilai dan arah."),
      choice("Perubahan kecepatan per satuan waktu disebut ...", ["Jarak", "Energi", "Percepatan", "Massa"], 2, "Percepatan mengukur perubahan kecepatan terhadap waktu."),
      choice("Gaya 10 N bekerja pada massa 2 kg. Percepatannya ...", ["5 m/s2", "12 m/s2", "20 m/s2", "0,2 m/s2"], 0, "a = F/m = 10/2 = 5 m/s2."),
      choice("Energi karena gerak disebut energi ...", ["Potensial", "Kinetik", "Kimia", "Listrik"], 1, "Energi kinetik dimiliki benda yang bergerak."),
      choice("Satuan SI untuk waktu adalah ...", ["Jam", "Menit", "Sekon", "Hari"], 2, "Sekon (s) adalah satuan dasar SI untuk waktu."),
      choice("Jika resultan gaya nol, benda dapat ...", ["Selalu mempercepat", "Bergerak dengan kecepatan tetap", "Selalu berputar", "Berubah massa"], 1, "Menurut hukum I Newton, benda diam atau bergerak lurus dengan kecepatan tetap."),
    ],
    words: [["GAYA", "Interaksi yang dapat mengubah gerak benda."], ["MASSA", "Ukuran kelembaman benda, satuan SI-nya kilogram."], ["ENERGI", "Kemampuan untuk melakukan usaha."], ["GERAK", "Perubahan posisi benda terhadap titik acuan."], ["VEKTOR", "Besaran yang memiliki nilai dan arah."]],
    post: [choice("Massa 3 kg diberi gaya resultan 12 N. Percepatannya ...", ["4 m/s2", "9 m/s2", "15 m/s2", "36 m/s2"], 0, "a = 12/3 = 4 m/s2."), truth("Kelajuan dan kecepatan sama-sama besaran vektor.", false, "Kelajuan adalah skalar, sedangkan kecepatan adalah vektor."), short("Benda menempuh 60 m selama 10 s. Berapa kelajuannya dalam m/s?", "6", "Kelajuan = 60/10 = 6 m/s.")],
  },
  programming: {
    title: "Algoritma dan Pemrograman", topic: "Logika, variabel, dan perulangan",
    pre: [
      choice("Urutan langkah logis untuk menyelesaikan masalah disebut ...", ["Algoritma", "Perangkat keras", "Jaringan", "Berkas"], 0, "Algoritma adalah langkah terurut untuk menyelesaikan masalah."),
      choice("Tempat menyimpan nilai yang bisa berubah disebut ...", ["Komentar", "Variabel", "Operator", "Diagram"], 1, "Variabel menyimpan nilai yang dapat berubah."),
      choice("Tipe data true atau false disebut ...", ["String", "Integer", "Boolean", "Array"], 2, "Boolean hanya mempunyai dua nilai logika."),
      choice("Struktur untuk menjalankan langkah berulang adalah ...", ["Perulangan", "Komentar", "Konstanta", "Impor"], 0, "Perulangan mengeksekusi blok berulang kali."),
      choice("Percabangan if digunakan untuk ...", ["Menghapus kode", "Mengambil keputusan", "Mengganti bahasa", "Mencetak semua data"], 1, "if memilih eksekusi berdasarkan kondisi."),
      choice("Operator sisa pembagian biasanya ditulis ...", ["+", "*", "%", "/"], 2, "Operator modulo (%) menghasilkan sisa pembagian."),
      choice("Hasil 7 % 3 adalah ...", ["0", "1", "2", "3"], 1, "7 = 2 x 3 + 1."),
      choice("Struktur penyimpan beberapa nilai berurutan adalah ...", ["Array", "Boolean", "Komentar", "Kondisi"], 0, "Array menyimpan koleksi nilai terurut."),
      choice("Jika x = 2, lalu x = x + 3, nilai akhir x adalah ...", ["2", "3", "5", "6"], 2, "Nilai lama x ditambah 3 lalu disimpan kembali."),
      choice("Mencari dan memperbaiki kesalahan program disebut ...", ["Browsing", "Debugging", "Drawing", "Sorting"], 1, "Debugging adalah proses menemukan dan memperbaiki bug."),
    ],
    words: [["ALGORITMA", "Langkah logis dan terurut untuk menyelesaikan masalah."], ["VARIABEL", "Tempat menyimpan nilai yang dapat berubah."], ["ARRAY", "Koleksi nilai yang tersusun berurutan."], ["LOGIKA", "Dasar penalaran untuk menentukan benar atau salah."], ["ITERASI", "Satu pengulangan dalam sebuah perulangan."]],
    post: [choice("Perulangan dijalankan untuk i = 1, 2, 3. Berapa kali blok dieksekusi?", ["2", "3", "4", "5"], 1, "Ada tiga nilai i, sehingga blok dijalankan tiga kali."), truth("Variabel dapat menyimpan nilai yang berubah selama program berjalan.", true, "Nilai variabel dapat diperbarui melalui penugasan."), short("Berapa sisa pembagian 10 oleh 3?", "1", "10 = 3 x 3 + 1, jadi sisanya 1.")],
  },
  discrete: {
    title: "Matematika Diskrit", topic: "Himpunan dan logika",
    pre: [
      choice("Kumpulan objek yang terdefinisi jelas disebut ...", ["Himpunan", "Pecahan", "Gradien", "Turunan"], 0, "Anggota himpunan harus dapat ditentukan dengan jelas."),
      choice("Banyak anggota {1, 2, 3} adalah ...", ["1", "2", "3", "6"], 2, "Himpunan itu memiliki tiga anggota berbeda."),
      choice("Irisan {1, 2} dan {2, 3} adalah ...", ["{1}", "{2}", "{3}", "{1, 2, 3}"], 1, "Irisan memuat anggota yang ada di kedua himpunan."),
      choice("Gabungan {1, 2} dan {2, 3} adalah ...", ["{2}", "{1, 3}", "{1, 2, 3}", "{}"], 2, "Gabungan memuat semua anggota tanpa pengulangan."),
      choice("Negasi dari pernyataan benar bernilai ...", ["Benar", "Salah", "Keduanya", "Tidak diketahui"], 1, "Negasi membalik nilai kebenaran."),
      choice("Benar AND salah menghasilkan ...", ["Benar", "Salah", "Nol anggota", "Tak hingga"], 1, "Konjungsi benar hanya jika kedua pernyataan benar."),
      choice("Benar OR salah menghasilkan ...", ["Salah", "Benar", "Tidak diketahui", "Kosong"], 1, "Disjungsi inklusif benar jika setidaknya satu pernyataan benar."),
      choice("Banyak himpunan bagian dari {a, b} adalah ...", ["2", "3", "4", "8"], 2, "Banyak himpunan bagian adalah 2 pangkat n = 2 pangkat 2 = 4."),
      choice("Graf terdiri dari simpul dan ...", ["Turunan", "Sisi", "Pecahan", "Sudut saja"], 1, "Sisi menghubungkan simpul-simpul dalam graf."),
      choice("Banyak cara menyusun dua buku berbeda adalah ...", ["1", "2", "3", "4"], 1, "Dua susunan: AB dan BA, atau 2! = 2."),
    ],
    words: [["HIMPUNAN", "Kumpulan objek yang terdefinisi dengan jelas."], ["IRISAN", "Anggota yang sama pada dua himpunan."], ["GABUNGAN", "Operasi yang memuat semua anggota dari dua himpunan."], ["NEGASI", "Operasi yang membalik nilai kebenaran."], ["GRAF", "Struktur yang tersusun dari simpul dan sisi."]],
    post: [choice("Irisan {2, 4, 6} dan {4, 6, 8} adalah ...", ["{2, 8}", "{4, 6}", "{2, 4, 6, 8}", "{}"], 1, "Anggota yang ada di kedua himpunan adalah 4 dan 6."), truth("Himpunan kosong merupakan himpunan bagian dari setiap himpunan.", true, "Tidak ada anggota himpunan kosong yang melanggar syarat himpunan bagian."), short("Berapa banyak anggota himpunan {2, 4, 6, 8}?", "4", "Ada empat anggota berbeda.")],
  },
  calculus: {
    title: "Kalkulus", topic: "Limit, turunan, dan integral dasar",
    pre: [
      choice("Turunan f(x) = x kuadrat adalah ...", ["x", "2x", "2", "x kubik"], 1, "Aturan pangkat: turunan x pangkat n adalah n x pangkat n-1."),
      choice("Turunan sebuah konstanta adalah ...", ["0", "1", "Konstanta itu", "x"], 0, "Konstanta tidak berubah terhadap x."),
      choice("Turunan f(x) = 3x adalah ...", ["0", "x", "3", "3x"], 2, "Turunan ax adalah a."),
      choice("Limit x + 2 saat x mendekati 3 adalah ...", ["2", "3", "5", "6"], 2, "Fungsi kontinu: substitusi langsung menghasilkan 3 + 2 = 5."),
      choice("Integral tak tentu dari 1 terhadap x adalah ...", ["0", "1", "x + C", "2x + C"], 2, "Turunan x + C adalah 1."),
      choice("Turunan f(x) = x kubik adalah ...", ["x kuadrat", "3x kuadrat", "3x", "3"], 1, "Gunakan aturan pangkat dengan n = 3."),
      choice("Turunan mengukur ...", ["Laju perubahan sesaat", "Jumlah anggota", "Sisa pembagian", "Massa"], 0, "Turunan merepresentasikan laju perubahan sesaat."),
      choice("Jika f(x) = 2x + 1, maka f(3) = ...", ["3", "5", "6", "7"], 3, "f(3) = 2(3) + 1 = 7."),
      choice("Integral tak tentu dari 2x adalah ...", ["2 + C", "x kuadrat + C", "2x kuadrat + C", "x + C"], 1, "Turunan x kuadrat adalah 2x."),
      choice("Kemiringan garis singgung ditentukan oleh ...", ["Integral", "Turunan", "Himpunan", "Modulo"], 1, "Nilai turunan pada suatu titik memberi gradien garis singgung."),
    ],
    words: [["TURUNAN", "Laju perubahan sesaat suatu fungsi."], ["INTEGRAL", "Operasi kebalikan dari diferensiasi."], ["LIMIT", "Nilai yang didekati fungsi ketika variabel mendekati titik tertentu."], ["FUNGSI", "Aturan yang memetakan setiap masukan ke tepat satu keluaran."], ["GRADIEN", "Kemiringan garis pada bidang koordinat."]],
    post: [choice("Turunan f(x) = 4x adalah ...", ["0", "4", "4x", "x kuadrat"], 1, "Turunan ax adalah a, sehingga hasilnya 4."), truth("Turunan dari konstanta 8 adalah 8.", false, "Turunan konstanta adalah nol."), short("Jika f(x) = x kuadrat, berapa f'(3)?", "6", "f'(x) = 2x, sehingga f'(3) = 6.")],
  },
};

export function courseFor(subject = "") {
  if (/algoritma|pemrograman/i.test(subject)) return "programming";
  if (/fisika/i.test(subject)) return "physics";
  if (/diskrit/i.test(subject)) return "discrete";
  if (/kalkulus/i.test(subject)) return "calculus";
  if (/matematika|aljabar/i.test(subject)) return "algebra";
  return null;
}

export function createPuzzle(courseId) {
  const layout = crosswordGenerator.generateLayout(courses[courseId].words.map(([answer, clue]) => ({ answer, clue })));
  const words = layout.result.filter((word) => word.orientation !== "none").map((word) => ({
    ...word, row: word.starty - 1, col: word.startx - 1,
    cells: Array.from(word.answer, (_, index) => `${word.starty - 1 + (word.orientation === "down" ? index : 0)}:${word.startx - 1 + (word.orientation === "across" ? index : 0)}`),
  }));
  const starts = [...new Set(words.map((word) => `${word.row}:${word.col}`))].sort((a, b) => {
    const [rowA, colA] = a.split(":").map(Number), [rowB, colB] = b.split(":").map(Number);
    return rowA - rowB || colA - colB;
  });
  words.forEach((word) => { word.position = starts.indexOf(`${word.row}:${word.col}`) + 1; });
  words.sort((a, b) => a.position - b.position);
  return { rows: layout.rows, cols: layout.cols, words };
}

export const normalizeAnswer = (value) => String(value ?? "").trim().toUpperCase();
export const correctQuestion = (question, answer) => question.type === "short"
  ? normalizeAnswer(answer) === normalizeAnswer(question.correct) : answer === question.correct;
export const wordGuess = (word, cells) => word.cells.map((cell) => cells[cell] || " ").join("");
export function gradeTest(courseId, mode, attempt) {
  const course = courses[courseId];
  const questions = mode === "pre" ? course.pre : course.post;
  const items = questions.map((question, index) => ({
    prompt: question.prompt, answer: question.type === "short" ? attempt.answers[index] : question.options[attempt.answers[index]],
    expected: question.type === "short" ? question.correct : question.options[question.correct],
    correct: correctQuestion(question, attempt.answers[index]), explanation: question.explanation,
  }));
  if (mode === "post") items.unshift(...attempt.puzzle.words.map((word) => ({
    prompt: `${word.position} ${word.orientation === "across" ? "mendatar" : "menurun"}: ${word.clue}`,
    answer: wordGuess(word, attempt.cells).trim(), expected: word.answer,
    correct: wordGuess(word, attempt.cells) === word.answer, explanation: word.clue,
  })));
  const correct = items.filter((item) => item.correct).length;
  return { items, correct, total: items.length, score: Math.round(correct / items.length * 100) };
}
