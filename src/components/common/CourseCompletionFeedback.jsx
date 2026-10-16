import AppIcon from './AppIcon';
import './CourseCompletionFeedback.css';

export default function CourseCompletionFeedback({ completion, title }) {
  if (!completion) return null;
  return <section className="course-completion-feedback" aria-label="Feedback course selesai">
    <div className="course-completion-heading">
      <span className="course-completion-icon"><AppIcon name="solar:check-circle-bold" size={32} /></span>
      <div><span className="course-completion-badge">Course selesai</span><h2>Selamat, kamu berhasil menyelesaikan {title}!</h2></div>
      <strong className="course-completion-score">{completion.score}<small>/100</small></strong>
    </div>
    <p>{completion.summary}</p>
    <p className="course-completion-meta">Feedback dari {completion.tutor} · {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${completion.completedAt}T00:00:00`))}{completion.isDemo ? ' · Contoh hasil belajar' : ''}</p>
    <div className="course-completion-details">
      <div><h3>Yang sudah kamu kuasai</h3><ul>{completion.strengths.map((strength) => <li key={strength}>{strength}</li>)}</ul></div>
      <div><h3>Saran tutor</h3><p>{completion.improvement}</p><h3>Langkah berikutnya</h3><p>{completion.nextStep}</p></div>
    </div>
  </section>;
}
