import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { EmptyState } from "../../../components/common/ActivityUI";
import { useProfile } from "../../../state/profile";
import { courseCatalog } from "../../../state/courseCatalog";
import { courseLearningProgress } from "../../../state/learningProgress";
import { savePortfolio, saveProject, deleteProject } from "../../../state/careerStore";
import { careerSkills, proficiencyLabels } from "../../../state/careerSkills";
import { safeURL } from "../../../state/careerModel";
import { eligibleCertificate, portfolioPublicData } from "../../../state/portfolioModel";
import { getMentorProgress, mentorLevels } from "../../../state/mentorProgress";
import useRoadmapProgress from "./useRoadmapProgress";
import { CareerHero, CareerMeter, CareerPage, CareerTarget } from "./CareerUI";
import profilePicture from "../../../assets/alya-profile.avif";
import CareerAccountSync from "./CareerAccountSync";

const blankProject = () => ({ title: "", description: "", technologies: "", github: "", demo: "", image: "", skills: [], visible: true });
const visibilityLabels = { introduction: "Perkenalan", skills: "Skills", projects: "Projects", certificates: "Certificates & badges", learning: "Learning experience", teaching: "Peer teaching" };

function PortfolioPreview({ view, onBack }) {
  return <div className="career-feature-page"><div className="career-section-heading"><h1>Portfolio Preview</h1><button className="activity-outline" onClick={onBack}>Kembali mengedit</button></div><p className="career-explainer">Hanya bagian dan proyek yang kamu izinkan untuk dibagikan yang terlihat di preview ini.</p>
    <section className="portfolio-profile"><div><span className="career-badge">Tutor.in / Learning Portfolio</span><h2>{view.introduction?.name || "Learning Portfolio"}</h2>{view.introduction && <><strong>{view.introduction.career}</strong><p>{view.introduction.bio}</p><p>{view.introduction.interests}</p></>}</div></section>
    {view.skills.length > 0 && <section className="activity-panel"><h2>Skills</h2><div className="roadmap-skill-tags">{view.skills.map((skill) => <span key={skill.title}>{skill.title} / {proficiencyLabels[skill.level]} / {skill.source}</span>)}</div></section>}
    {view.projects.length > 0 && <section className="activity-panel"><h2>Projects</h2><div className="career-cards">{view.projects.map((project) => <article className="portfolio-project" key={project.title + project.description}>{project.image ? <img src={project.image} alt={project.title} /> : <div className="portfolio-project-art" aria-hidden="true"><AppIcon name="career:folder" size={46} /></div>}<div><h3>{project.title}</h3><p>{project.description}</p><p>{project.technologies}</p><div className="roadmap-skill-tags">{project.skills.map((skill) => <span key={skill}>{skill} / self-reported</span>)}</div><div className="career-actions">{safeURL(project.github) && <a className="activity-outline" href={safeURL(project.github)} target="_blank" rel="noopener noreferrer">GitHub</a>}{safeURL(project.demo) && <a className="activity-primary" href={safeURL(project.demo)} target="_blank" rel="noopener noreferrer">Live demo</a>}</div></div></article>)}</div></section>}
    {[['Learning records', view.certificates.map((record) => `${record.title} / ${record.id}`)], ['Achievements', view.achievements], ['Learning experience', view.learning], ['Peer teaching experience', view.teaching]].filter(([, values]) => values.length).map(([title, values]) => <section className="activity-panel" key={title}><h2>{title}</h2>{values.map((value, index) => <p className="career-explainer" key={index}>{value}</p>)}</section>)}
  </div>;
}

function RelatedSkills({ values = [], onChange }) {
  return <fieldset className="portfolio-related-skills">
    <legend>Related skills</legend>
    <p>Pilih semua skill yang digunakan dalam proyek ini.</p>
    <div className="portfolio-skill-options">{Object.entries(careerSkills).map(([id, skill]) => <label className="portfolio-skill-option" key={id}>
      <input type="checkbox" checked={values.includes(id)} onChange={(event) => onChange(event.target.checked ? [...values, id] : values.filter((value) => value !== id))} />
      <span>{skill.title}</span>
    </label>)}</div>
    <small>{values.length} skill dipilih</small>
  </fieldset>;
}

export default function CareerPortfolio({ setActive, onPortfolioReview }) {
  const { career, analysis, profile: skills, careerState, data, enrollments, allAssessments, progress } = useRoadmapProgress();
  const profile = useProfile();
  const [intro, setIntro] = useState({ bio: careerState.portfolio.bio, interests: careerState.portfolio.interests });
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [pendingDelete, setPendingDelete] = useState("");
  const [exporting, setExporting] = useState(false);
  const courses = courseCatalog.map((course) => ({ course, learning: courseLearningProgress(course, data.sessions, enrollments[course.id]) }));
  const certificates = courses.flatMap(({ course, learning }) => { const record = eligibleCertificate(course, learning, enrollments[course.id], allAssessments); return record ? [{ title: course.title, id: record.id, issuedAt: record.issuedAt }] : []; });
  const learningExperience = courses.filter(({ learning }) => learning.completedLessons.length > 0 || learning.completedSessions.length > 0).map(({ course, learning }) => `${course.title}: ${learning.completedLessons.length}/${course.sessions.length} materi dipelajari, ${learning.completedSessions.length} sesi selesai${learning.percent === 100 ? " / seluruh materi tercatat" : ""}`);
  const teaching = data.sessions.filter((session) => session.role === "mentor" && session.status === "Selesai").map((session) => `${session.subject} / ${session.date} / ${session.duration} menit mengajar`);
  const mentor = getMentorProgress(data);
  const achievements = [...(progress.completed >= 1 ? ["Langkah pertama / milestone roadmap tercapai"] : []), ...(progress.completed >= 4 ? ["Setengah perjalanan / 4 milestone tercapai"] : []), ...(progress.percent === 100 ? ["Roadmap finisher"] : []), ...(teaching.length ? [mentorLevels[mentor.currentIndex].name] : [])];
  const completion = Math.round([!!careerState.portfolio.bio.trim(), !!careerState.portfolio.interests.trim(), analysis.skills.some((skill) => skill.level > 0), careerState.projects.length > 0, learningExperience.length > 0].filter(Boolean).length / 5 * 100);
  const view = portfolioPublicData({ profile, career, state: careerState, skills: Object.values(skills), certificates, learning: learningExperience, teaching, achievements });
  function act(callback, success) { try { callback(); setMessage(success); } catch (error) { setMessage(error.message || "Perubahan belum tersimpan. Coba kembali."); } }
  function submitProject(event) {
    event.preventDefault();
    if ((project.github && !safeURL(project.github)) || (project.demo && !safeURL(project.demo))) { setMessage("Gunakan URL http atau https yang valid."); return; }
    act(() => { saveProject(project); setProject(null); }, "Proyek tersimpan. Skills terkait tetap ditandai sebagai catatan pemilik, bukan verifikasi.");
  }
  async function uploadImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) { setMessage("Pilih PNG, JPG, atau WebP maksimal 1 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => setProject((current) => current ? { ...current, image: reader.result } : null);
    reader.onerror = () => setMessage("Gambar tidak dapat dibaca. Coba file lain.");
    reader.readAsDataURL(file);
  }
  async function exportPortfolio() {
    if (exporting) return;
    setExporting(true); setMessage("");
    try {
      const { downloadPortfolioPDF } = await import("../../../state/portfolioPDF");
      await downloadPortfolioPDF(view);
      setMessage("Portfolio PDF berhasil diunduh. File hanya memuat bagian yang kamu izinkan untuk dibagikan.");
    } catch (error) { setMessage(error.message || "PDF belum dapat diunduh. Coba kembali."); }
    finally { setExporting(false); }
  }
  if (preview) return <PortfolioPreview view={view} onBack={() => setPreview(false)} />;
  return <CareerPage active="Career Portfolio" setActive={setActive}>
    <CareerHero title="My Career Portfolio" text="Rangkai perjalanan belajarmu menjadi cerita yang siap kamu bagikan." icon="career:folder" tone="green"><CareerTarget /></CareerHero>
    <CareerAccountSync onLoaded={(portfolio) => setIntro({ bio: portfolio.bio, interests: portfolio.interests })} />
    <section className="portfolio-profile"><img src={profilePicture} alt="Foto profil" /><div><h2>{profile.firstName} {profile.lastName}</h2><strong>{career.title}</strong><p>Identitas mengikuti profil Tutor.in.</p><button className="text-link" onClick={() => setActive("Akun")}>Edit nama & profil</button></div></section>
    <section className="activity-panel portfolio-completion"><div className="career-section-heading"><div><span className="career-skill-index">CERITA BELAJARMU</span><h2>Portfolio {completion}% lengkap</h2></div><span className="career-badge">Tersinkron dengan akun</span></div><CareerMeter value={completion} label="Kelengkapan portfolio" /><p className="career-explainer">Lengkapi bio, minat, skills, proyek, dan pengalaman belajar. Indikator ini bukan penilaian kemampuan.</p></section>
    <p className="activity-feedback" role="status">{message}</p>
    <section className="activity-panel"><h2>Personal introduction</h2><form className="career-form" aria-label="Personal introduction" onSubmit={(event) => { event.preventDefault(); act(() => savePortfolio(intro), "Perkenalan tersimpan."); }}><label>Short biography<textarea maxLength={1200} value={intro.bio} onChange={(event) => setIntro({ ...intro, bio: event.target.value })} placeholder="Ceritakan apa yang sedang kamu pelajari dan ingin kamu bangun." /></label><label>Professional interests<input maxLength={250} value={intro.interests} onChange={(event) => setIntro({ ...intro, interests: event.target.value })} placeholder="Contoh: accessible web, product design, education" /></label><div><button className="activity-primary" type="submit">Simpan perkenalan</button></div></form></section>
    <section className="activity-panel"><div className="career-section-heading"><h2>Skills & technologies</h2><button className="text-link" onClick={() => setActive("Skill Analysis")}>Update skill analysis</button></div><div className="roadmap-skill-tags">{Object.values(skills).filter((skill) => skill.level > 0).map((skill) => <span key={skill.id}>{skill.title} / {proficiencyLabels[skill.level]} / {skill.source}</span>)}</div>{!Object.values(skills).some((skill) => skill.level > 0) && <p className="career-explainer">Belum ada skill tercatat. Lengkapi assessment atau catat materi yang sudah dipelajari.</p>}<p className="career-explainer">Skill berasal dari data belajar dan assessment. Menambahkan teknologi ke proyek tidak mengubah level skill.</p></section>
    <section className="activity-panel"><div className="career-section-heading"><h2>Projects</h2><button className="activity-primary" onClick={() => setProject(blankProject())}><AppIcon name="career:folder" size={17} />Tambah proyek</button></div>
      {project && <form className="career-form" aria-label="Project editor" onSubmit={submitProject}><label>Project title<input required maxLength={120} value={project.title} onChange={(event) => setProject({ ...project, title: event.target.value })} /></label><label>Description<textarea required maxLength={2000} value={project.description} onChange={(event) => setProject({ ...project, description: event.target.value })} /></label><label>Technologies used<input maxLength={250} value={project.technologies} onChange={(event) => setProject({ ...project, technologies: event.target.value })} /></label><div className="career-form-columns"><label>GitHub repository URL<input type="url" value={project.github} onChange={(event) => setProject({ ...project, github: event.target.value })} /></label><label>Live demo URL<input type="url" value={project.demo} onChange={(event) => setProject({ ...project, demo: event.target.value })} /></label></div><RelatedSkills values={project.skills} onChange={(skills) => setProject((current) => ({ ...current, skills }))} /><label>Screenshot / project image (PNG, JPG, WebP, max 1 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} /></label>{project.image && <div><img src={project.image} alt="Project preview" style={{ maxWidth: "100%", maxHeight: 180 }} /><button type="button" className="text-link" onClick={() => setProject({ ...project, image: "" })}>Hapus gambar</button></div>}<label className="career-check"><input type="checkbox" checked={project.visible !== false} onChange={(event) => setProject({ ...project, visible: event.target.checked })} />Izinkan proyek ini muncul di preview publik</label><div className="career-actions"><button className="activity-primary" type="submit">Simpan proyek</button><button className="activity-outline" type="button" onClick={() => setProject(null)}>Batal</button></div></form>}
      <div className="career-cards">{careerState.projects.map((item) => <article className="portfolio-project" key={item.id}>{item.image ? <img src={item.image} alt={item.title} /> : <div className="portfolio-project-art" aria-hidden="true"><AppIcon name="career:folder" size={46} /></div>}<div><span className="career-badge">{item.visible === false ? "Private project" : "Public preview enabled"}</span><h3>{item.title}</h3><p>{item.description}</p><p>{item.technologies}</p><div className="roadmap-skill-tags">{item.skills?.map((id) => <span key={id}>{careerSkills[id]?.title || id} / self-reported</span>)}</div><div className="career-actions"><button className="activity-outline" onClick={() => setProject({ ...blankProject(), ...item })}>Edit</button>{pendingDelete === item.id ? <><button className="activity-primary" onClick={() => act(() => { deleteProject(item.id); setPendingDelete(""); }, "Proyek dihapus.")}>Ya, hapus</button><button className="text-link" onClick={() => setPendingDelete("")}>Batal</button></> : <button className="text-link" onClick={() => setPendingDelete(item.id)}>Hapus</button>}</div></div></article>)}</div>{!careerState.projects.length && !project && <EmptyState title="Cerita proyekmu dimulai di sini" description="Tambahkan proyek course, eksperimen pribadi, atau karya kolaborasi." />}</section>
    <section className="activity-panel"><h2>Certificates & achievements</h2><div className="portfolio-achievements">{achievements.map((badge) => <span key={badge}><AppIcon name="career:star" size={21} />{badge}</span>)}</div>{certificates.length ? certificates.map((record) => <article className="portfolio-experience" key={record.id}><h3>{record.title}</h3><p>Tutor.in learning record / {record.id} / {record.issuedAt}</p></article>) : <p className="career-explainer">Belum ada sertifikat yang memenuhi syarat. Diperlukan semua materi, post-test per sesi yang lulus, final project yang disetujui, dan catatan penerbitan Tutor.in. Centang mandiri tidak menerbitkan sertifikat.</p>}</section>
    <section className="activity-panel"><h2>Learning & teaching experience</h2>{learningExperience.map((value) => <div className="portfolio-experience" key={value}><p>{value}</p></div>)}{teaching.length > 0 && <><h3>Peer tutor experience</h3>{teaching.map((value, index) => <div className="portfolio-experience" key={index}><p>{value}</p></div>)}</>}{!learningExperience.length && !teaching.length && <p className="career-explainer">Pengalaman muncul otomatis dari aktivitas belajar dan mengajar yang tercatat.</p>}</section>
    <section className="activity-panel"><h2>Atur yang kamu bagikan</h2><p className="career-explainer">Preview dan file yang dibagikan hanya menyertakan bagian terpilih. Email, nomor telepon, tanggal lahir, saldo, dan hasil jawaban tes tidak disertakan.</p><div className="portfolio-privacy">{Object.entries(visibilityLabels).map(([id, label]) => <label className="career-check" key={id}><input type="checkbox" checked={careerState.portfolio.visibility[id]} onChange={(event) => act(() => savePortfolio({ visibility: { ...careerState.portfolio.visibility, [id]: event.target.checked } }), "Pengaturan visibilitas tersimpan.")} />{label}</label>)}</div><div className="career-actions"><button className="activity-outline" onClick={() => setPreview(true)}>Preview publik</button><button className="activity-primary" disabled={exporting} onClick={exportPortfolio}>{exporting ? "Menyiapkan PDF?" : "Unduh portfolio PDF"}</button><button className="text-link" onClick={onPortfolioReview || (() => setActive("Industry Mentorship"))}>Minta portfolio review</button></div><p className="career-explainer">Unduhan berupa PDF dengan bagian portfolio yang kamu pilih. Perubahan setelah mengunduh tidak mengubah PDF yang sudah dibagikan.</p></section>
  </CareerPage>;
}
