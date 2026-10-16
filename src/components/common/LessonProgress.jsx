import { useState } from "react";
import { updateEnrollment } from "../../state/enrollments";
import "./LessonProgress.css";

export default function LessonProgress({ course, learning, enrollment, lessonIndices = course.sessions.map((_, index) => index), enabled = true }) {
  const [message, setMessage] = useState("");
  const canTrack = enabled && (enrollment?.registered || learning.activity.length > 0);
  function toggle(index) {
    const completedLessons = learning.practicedLessons.includes(index)
      ? learning.practicedLessons.filter((item) => item !== index)
      : [...learning.practicedLessons, index];
    try {
      updateEnrollment(course.id, { completedLessons });
      setMessage("Progres belajar tersimpan dan tersinkron dengan roadmap.");
    } catch { setMessage("Progres belum tersimpan. Coba kembali setelah koneksi tersedia."); }
  }
  return <div className="lesson-progress">
    <p>Centang materi yang sudah kamu pelajari. Catatan mandiri ini tidak menggantikan post-test atau sertifikat.</p>
    {lessonIndices.map((index) => <label key={index}>
      <input type="checkbox" checked={learning.completedLessons.includes(index)}
        disabled={!canTrack || learning.sessionLessons.includes(index)} onChange={() => toggle(index)} />
      <span>{course.sessions[index]}{learning.sessionLessons.includes(index) && <small>Tercatat dari sesi selesai</small>}</span>
    </label>)}
    {!canTrack && <p>{enabled ? "Daftar course untuk mulai mencatat progres belajarmu." : "Selesaikan milestone sebelumnya untuk mencatat materi ini dari roadmap."}</p>}
    {learning.unassignedSessions > 0 && <p>{learning.unassignedSessions} sesi selesai belum memiliki nomor materi. Tandai materi yang dipelajari agar progresnya sesuai.</p>}
    <p role="status">{message}</p>
  </div>;
}
