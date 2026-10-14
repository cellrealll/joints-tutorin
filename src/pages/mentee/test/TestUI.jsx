import { useRef } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { gradeTest } from "./testData";

export function TestHeader({ title, subtitle, session, onBack }) {
  return <header className="test-heading">
    <button className="test-back" onClick={onBack}><AppIcon name="solar:alt-arrow-left-linear" size={18} />Kembali ke sesi</button>
    <h1>{title}</h1><p>{subtitle}</p>
    <span className="test-session"><AppIcon name="solar:book-2-linear" size={16} />{session.subject}{session.tutor ? ` / ${session.tutor}` : ""}</span>
  </header>;
}

export function TestTimer({ remaining }) {
  return <div className={`test-timer ${remaining <= 60 ? "urgent" : ""}`} role="timer" aria-label="Waktu tersisa">
    <span><AppIcon name="solar:clock-circle-linear" size={18} />Waktu tersisa</span>
    <strong>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</strong>
  </div>;
}

export function TestProgress({ value, total, label }) {
  return <div className="test-progress"><div><strong>{label}</strong><span>{Math.round(value / total * 100)}%</span></div>
    <div className="progress-track" role="progressbar" aria-label="Progres pengerjaan" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
      <div className="progress-fill" style={{ width: `${value / total * 100}%` }} />
    </div>
  </div>;
}

export function QuestionInput({ question, value, onChange, name }) {
  if (question.type === "short") return <input className="test-short-answer" aria-label={question.prompt} inputMode="decimal"
    placeholder="Jawaban" value={value ?? ""} onChange={(event) => onChange(event.target.value)} maxLength={30} autoComplete="off" />;
  return <div className="test-options" role="radiogroup" aria-label={question.prompt}>{question.options.map((option, index) => <label key={index} className="test-option" data-selected={value === index}>
    <input type="radio" name={name} checked={value === index} onChange={() => onChange(index)} />
    <span className="test-option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
    {value === index && <AppIcon name="solar:check-circle-bold" size={21} />}
  </label>)}</div>;
}

export function SubmitTest({ unanswered, onSubmit }) {
  const dialog = useRef(null);
  return <>
    <button className="activity-primary test-submit" onClick={() => dialog.current.showModal()}>Kirim jawaban<AppIcon name="solar:arrow-right-linear" size={18} /></button>
    <dialog className="activity-dialog test-confirm" ref={dialog} aria-labelledby="test-confirm-title">
      <div className="activity-dialog-heading"><h2 id="test-confirm-title">Kirim jawaban?</h2><button aria-label="Tutup konfirmasi" onClick={() => dialog.current.close()}><AppIcon name="solar:close-circle-linear" size={24} /></button></div>
      <p>{unanswered ? `${unanswered} soal belum terisi lengkap. Jawaban kosong akan dihitung salah.` : "Semua soal sudah terisi. Jawaban tidak dapat diubah setelah dikirim."}</p>
      <div className="test-confirm-actions"><button className="activity-outline" onClick={() => dialog.current.close()}>Periksa lagi</button>
        <button className="activity-primary" onClick={() => { dialog.current.close(); onSubmit(); }}>Ya, kirim</button></div>
    </dialog>
  </>;
}

export function TestResult({ courseId, mode, attempt, onBack, onPostTest }) {
  const result = gradeTest(courseId, mode, attempt);
  return <section className="test-result">
    <div className="test-result-summary">
      <span className="test-result-icon"><AppIcon name={mode === "pre" ? "solar:clipboard-check-linear" : "solar:cup-star-linear"} size={45} /></span>
      <div><span className="test-eyebrow">{mode === "pre" ? "Titik awal belajarmu" : "Tantangan selesai"}</span>
        <h2>{mode === "pre" ? "Pre-test selesai" : "Post-test selesai"}</h2>
        <p>{attempt.timedOut ? "Waktu habis. Jawaban terakhir dinilai otomatis." : "Jawabanmu berhasil dikirim."}</p>
        <p>{result.correct} dari {result.total} soal benar</p></div>
      <div className="test-score"><strong>{result.score}</strong><span>Nilai / 100</span></div>
    </div>
    <p className="test-result-note">{mode === "pre" ? "Hasil ini membantu mengenali materi yang perlu kamu pelajari bersama mentor." : result.score >= 75 ? "Pemahamanmu sudah kuat. Pertahankan dan lanjutkan latihan!" : "Masih ada konsep yang bisa diperkuat. Bahas soal berikut bersama mentor."}</p>
    <div className="test-result-actions"><button className="activity-outline" onClick={onBack}><AppIcon name="solar:arrow-left-linear" size={18} />Kembali ke sesi</button>
      {mode === "pre" && onPostTest && <button className="activity-primary" onClick={onPostTest}>Buka post-test<AppIcon name="solar:arrow-right-linear" size={18} /></button>}</div>
    <h2 className="test-review-title">Pembahasan</h2>
    <div className="test-review-list">{result.items.map((item, index) => <details key={index} className="test-review" data-correct={item.correct}>
      <summary><AppIcon name={item.correct ? "solar:check-circle-bold" : "solar:close-circle-linear"} size={21} /><span>{item.prompt}</span><strong>{item.correct ? "Benar" : "Perlu ditinjau"}</strong></summary>
      <div><p>Jawabanmu: <strong>{item.answer || "Belum dijawab"}</strong></p><p>Jawaban tepat: <strong>{item.expected}</strong></p><p>{item.explanation}</p></div>
    </details>)}</div>
  </section>;
}
