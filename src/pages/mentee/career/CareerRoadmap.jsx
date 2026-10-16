import Dropdown from "../../../components/common/Dropdown";
import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import LessonProgress from "../../../components/common/LessonProgress";
import { selectCareer, toggleRoadmapPractice } from "../../../state/roadmapStore";
import { getMentorProgress, mentorLevels } from "../../../state/mentorProgress";
import { careerRoadmaps } from "./roadmapData";
import useRoadmapProgress from "./useRoadmapProgress";
import mascot from "../../../assets/mascot-reading.png";
import "../../../components/common/ActivityUI.css";
import "./CareerRoadmap.css";

const statusLabels = { completed: "Selesai", ongoing: "Sedang dipelajari", locked: "Tahap berikutnya" };

function RoadmapJourney({ career, progress, enrollments, onCourseDetail }) {
  const [expanded, setExpanded] = useState(progress.next?.id || progress.stages[0].id);
  const [message, setMessage] = useState("");
  function togglePractice(stage) {
    try {
      toggleRoadmapPractice(`${career.id}:${stage.id}`);
      setMessage(stage.completed ? "Catatan latihan dibatalkan." : "Latihan mandiri tercatat. Milestone berikutnya terbuka!");
    } catch { setMessage("Progres belum tersimpan. Coba kembali setelah koneksi tersedia."); }
  }
  return <section className="activity-panel roadmap-journey" aria-labelledby="roadmap-journey-title">
    <div className="roadmap-section-heading"><div><span className="roadmap-eyebrow">LANGKAH DEMI LANGKAH</span><h2 id="roadmap-journey-title">Perjalanan belajarmu</h2></div><span>{progress.completed}/{progress.stages.length} milestone</span></div>
    <div className="roadmap-legend"><span><i className="completed" />Selesai</span><span><i className="ongoing" />Sedang dipelajari</span><span><AppIcon name="career:lock" size={13} />Terkunci berurutan</span></div>
    <ol className="roadmap-timeline">
      {progress.stages.map((stage, index) => <li className={`roadmap-stage ${stage.status}`} key={stage.id} aria-current={stage.status === "ongoing" ? "step" : undefined}>
        <span className="roadmap-node" aria-hidden="true">{stage.completed ? <AppIcon name="career:check" size={23} /> : stage.status === "locked" ? <AppIcon name="career:lock" size={21} /> : String(index + 1).padStart(2, "0")}</span>
        <article className="roadmap-stage-card">
          <button className="roadmap-stage-toggle" aria-expanded={expanded === stage.id} aria-controls={`roadmap-content-${stage.id}`} onClick={() => setExpanded(expanded === stage.id ? "" : stage.id)}>
            <span className={`roadmap-skill-icon tone-${index % 4}`} aria-hidden="true"><AppIcon name={stage.icon} size={27} /></span>
            <span className="roadmap-stage-heading"><span className="roadmap-stage-number">MILESTONE {String(index + 1).padStart(2, "0")}</span><strong>{stage.title}</strong><span className="roadmap-stage-status">{stage.assessed ? "Kompetensi tercapai" : statusLabels[stage.status]}{stage.done > 0 && !stage.completed ? ` · ${stage.done}/${stage.total} materi` : ""}</span></span>
            <AppIcon name={expanded === stage.id ? "career:up" : "career:down"} size={20} />
          </button>
          <div id={`roadmap-content-${stage.id}`} hidden={expanded !== stage.id} className="roadmap-stage-content">
            <p>{stage.description}</p>
            <div className="roadmap-skill-tags">{stage.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            <div className="roadmap-course-link"><AppIcon name="career:book" size={22} /><div><small>{stage.relatedNote ? "COURSE TERKAIT" : "BELAJAR DI TUTOR.IN"}</small><strong>{stage.course.title}</strong></div></div>
            {stage.relatedNote && <p className="roadmap-related-note">{stage.relatedNote}</p>}
            {stage.assessed && <p className="career-demo-note">Kompetensi dasar milestone ini sudah ditunjukkan lewat assessment dan prasyarat. Ini tidak menerbitkan sertifikat course.</p>}
            {stage.lessons.length > 0 ? <LessonProgress course={stage.course} learning={stage.learning} enrollment={enrollments[stage.courseId]} lessonIndices={stage.lessons} enabled={stage.status !== "locked"} /> : <div className="roadmap-practice"><p>Progres tahap ini berasal dari catatan latihan mandiri.</p><button className="activity-outline" disabled={stage.status === "locked"} onClick={() => togglePractice(stage)}><AppIcon name={stage.completed ? "career:undo" : "career:check"} size={17} />{stage.completed ? "Batalkan catatan latihan" : "Tandai sudah berlatih"}</button></div>}
            {stage.status === "locked" && <p className="roadmap-lock-note"><AppIcon name="career:lock" size={14} />Selesaikan milestone sebelumnya untuk membuka tahap ini. Kamu tetap bisa melihat course-nya.</p>}
          </div>
          <div className="roadmap-stage-footer"><span>{stage.assessed ? "Assessment & prasyarat terpenuhi" : stage.lessons.length ? `${stage.done}/${stage.total} materi dipelajari` : "Latihan mandiri"}</span><button className={stage.status === "ongoing" ? "activity-primary" : "activity-outline"} onClick={() => onCourseDetail(stage.courseId)}>Learn This Skill<AppIcon name="career:right" size={16} /></button></div>
        </article>
      </li>)}
    </ol>
    <p className="activity-feedback" role="status">{message}</p>
    {progress.percent === 100 && <div className="roadmap-finished"><AppIcon name="career:cup" size={38} /><h3>Roadmap selesai!</h3><p>Kamu sudah mencatat semua milestone. Terus latih skill melalui proyek dan evaluasi bersama mentor.</p></div>}
  </section>;
}

export default function CareerRoadmap({ onCourseDetail, setActive }) {
  const { career, progress, assessments, enrollments, data } = useRoadmapProgress();
  const [message, setMessage] = useState("");
  const mentorProgress = getMentorProgress(data);
  const achievements = [
    { title: "Langkah pertama", description: "Selesaikan 1 milestone", unlocked: progress.completed >= 1, icon: "career:flag" },
    { title: "Setengah perjalanan", description: "Selesaikan 4 milestone", unlocked: progress.completed >= 4, icon: "career:star" },
    { title: "Roadmap finisher", description: "Selesaikan semua milestone", unlocked: progress.percent === 100, icon: "career:cup" },
  ];
  function chooseCareer(id) {
    try { selectCareer(id); setMessage(""); }
    catch { setMessage("Pilihan karier belum tersimpan. Coba kembali setelah koneksi tersedia."); }
  }
  return <div className="career-roadmap-page">
    <header className="activity-heading"><h1>My Career Roadmap</h1><p>Dari skill pertama hingga langkah karier berikutnya. Belajar terarah, tumbuh bersama.</p></header>
    <section className="roadmap-hero">
      <div><span className="roadmap-eyebrow">MASA DEPANMU, LANGKAHMU</span><h2>Skill hari ini.<br />Peluang esok hari.</h2><p>Tentukan tujuanmu, temukan langkah belajarnya, dan bangun skill bersama peer Tutor.in.</p><label htmlFor="career-target">Target karier</label><Dropdown id="career-target" ariaLabel="Target karier" className="career-target-dropdown" value={career.id} onChange={chooseCareer} options={careerRoadmaps.map((item) => ({ value: item.id, label: item.title }))} /><div className="roadmap-hero-meta"><span><AppIcon name="career:flag" size={16} />{progress.stages.length} milestone</span><span><AppIcon name="career:check" size={16} />{progress.percent}% tercapai</span></div></div>
      <img src={mascot} alt="" width="220" height="220" />
    </section>
    <div className="roadmap-career-options" role="group" aria-label="Pilih target karier">{careerRoadmaps.map((item) => <button key={item.id} aria-pressed={career.id === item.id} onClick={() => chooseCareer(item.id)}><AppIcon name={item.icon} size={22} />{item.title}{career.id === item.id && <AppIcon name="career:check" size={16} />}</button>)}</div>
    <p className="activity-feedback" role="status">{message}</p>
    <section className="roadmap-progress-summary" aria-label="Ringkasan progres roadmap">
      <div className="roadmap-progress-ring" style={{ "--roadmap-progress": `${progress.percent}%` }} role="progressbar" aria-label={`Progres ${career.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}><span><strong>{progress.percent}%</strong><small>tercapai</small></span></div>
      <div><span className="roadmap-eyebrow">ROADMAP PILIHANMU</span><h2>{career.title}</h2><p>{career.description}</p><span className="roadmap-summary-count"><AppIcon name="career:check" size={16} />{progress.completed} dari {progress.stages.length} milestone selesai</span></div>
      <div className="roadmap-next-step"><small>LANGKAH SELANJUTNYA</small><strong>{progress.next?.title || "Terus kembangkan proyekmu"}</strong><span>{progress.next ? "Satu langkah lebih dekat ke tujuanmu." : "Semua milestone sudah tercatat."}</span></div>
    </section>
    <div className="roadmap-layout">
      <RoadmapJourney key={career.id} career={career} progress={progress} enrollments={enrollments} onCourseDetail={onCourseDetail} />
      <aside className="roadmap-sidebar">
        <section className="activity-panel roadmap-tools"><span className="roadmap-panel-icon"><AppIcon name={career.icon} size={27} /></span><h2>Toolkit kariermu</h2><p>Kenali tools dan kompetensi yang akan kamu latih di jalur ini.</p><div className="roadmap-skill-tags">{career.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></section>
        <section className="activity-panel roadmap-achievements"><h2>Pencapaianmu</h2><p>Terbuka otomatis dari progres roadmap yang dipilih.</p>{achievements.map((achievement) => <div className={achievement.unlocked ? "earned" : ""} key={achievement.title}><span><AppIcon name={achievement.icon} size={23} /></span><div><strong>{achievement.title}</strong><small>{achievement.description}</small></div><AppIcon name={achievement.unlocked ? "career:check" : "career:lock"} size={17} /></div>)}{data.sessions.some((session) => session.role === "mentor" && session.status === "Selesai") && <div className="roadmap-peer-achievement earned"><span><AppIcon name="career:hat" size={23} /></span><div><strong>{mentorLevels[mentorProgress.currentIndex].name}</strong><small>Pencapaian mengajar yang sudah kamu raih</small></div></div>}</section>
        <section className="activity-panel roadmap-assessments"><h2>Evaluasi belajarmu</h2><p>Hasil tes dari course terkait. Skor membantu refleksi belajar dan tidak otomatis menyelesaikan milestone.</p>{assessments.length ? assessments.map((item) => <div key={`${item.sessionId}-${item.mode}`}><span><strong>{item.title}</strong><small>{item.mode === "pre" ? "Pre-test" : "Post-test"}</small></span><b>{item.score}<small>/100</small></b></div>) : <div className="roadmap-assessment-empty"><AppIcon name="career:clipboard" size={27} /><span>Belum ada evaluasi selesai untuk jalur ini.</span></div>}<button className="activity-outline" onClick={() => setActive("Courses")}>Lihat aktivitas belajar<AppIcon name="career:right" size={16} /></button></section>
        <section className="roadmap-tip"><AppIcon name="career:bulb" size={25} /><div><strong>Progresmu saling terhubung</strong><p>Materi course, sesi selesai dengan nomor materi, dan catatan latihan mandiri membentuk roadmap ini. Ganti target tanpa kehilangan progres belajarmu.</p></div></section>
      </aside>
    </div>
  </div>;
}
