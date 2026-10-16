import Dropdown from "../../../components/common/Dropdown";
import { useMemo, useRef, useState } from "react";
import { courseCatalog as courses } from "../../../state/courseCatalog";
import { saveEnrollments, useEnrollments } from "../../../state/enrollments";
import AppIcon from "../../../components/common/AppIcon";
import { addBooking, useTutorData } from "../../../state/tutorStore";
import { courseLearningProgress } from "../../../state/learningProgress";
import LessonProgress from "../../../components/common/LessonProgress";
import CourseCompletionFeedback from "../../../components/common/CourseCompletionFeedback";
import useRoadmapProgress from "../career/useRoadmapProgress";
import { recommendedCourseStart } from "../../../state/careerModel";
import { assessmentKey, assessmentResult, readAssessment } from "../test/assessmentStorage";
import { courseFor, placementLevel } from "../test/testData";
import { courseMatchesSearch } from "../../../state/searchCatalog";
import { isCreditError, useFeedback } from "../../../state/feedbackContext";
import TutorPortrait from "../../../components/common/TutorPortrait";

const shiftOptions = [
  { id: "shift-1", label: "Shift 1", time: "08:00", range: "08:00 - 10:00" },
  { id: "shift-2", label: "Shift 2", time: "10:00", range: "10:00 - 12:00" },
  { id: "shift-3", label: "Shift 3", time: "13:00", range: "13:00 - 15:00" },
  { id: "shift-4", label: "Shift 4", time: "15:00", range: "15:00 - 17:00" },
  { id: "shift-5", label: "Shift 5", time: "19:00", range: "19:00 - 21:00" },
];

const dayMeta = {
  Sen: { label: "Senin", offset: 1 },
  Sel: { label: "Selasa", offset: 2 },
  Rab: { label: "Rabu", offset: 3 },
  Kam: { label: "Kamis", offset: 4 },
  Jum: { label: "Jumat", offset: 5 },
  Sab: { label: "Sabtu", offset: 6 },
  Min: { label: "Minggu", offset: 0 },
};


const categoryOptions = ["IT", "Design", "Communication"];
function formatAvailability(tutor) {
  const shift = shiftOptions.find((item) => item.id === tutor.availability.shift);
  const days = tutor.availability.days.map((day) => dayMeta[day].label).join(", ");
  return `Every ${days}, ${shift.range}`;
}

function creditRange(course) {
  const credits = course.tutors.map((tutor) => tutor.creditsCourse);
  return `${Math.min(...credits)} - ${Math.max(...credits)} kredit`;
}

function nextDateFor(day) {
  const target = dayMeta[day].offset;
  const date = new Date();
  const distance = (target - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + distance);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}


function FilterSelect({ label, value, onChange, options }) {
  return <Dropdown ariaLabel={label} className="course-filter-dropdown" value={value} onChange={onChange} options={[{ value: "", label }, ...options.map((option) => ({ value: option, label: option }))]} />;
}

function CourseCard({ course, onOpen, completed }) {
  return (
    <article className="search-course-card">
      <div className="course-icon" aria-hidden="true">
        <AppIcon name="solar:notebook-bookmark-bold" size={50} />
      </div>
      <div className="search-course-info">
        <div className="search-course-title">
          <h2>{course.title}</h2>
          {completed && <span className="course-completion-badge">Course selesai</span>}
        </div>
        <p>{course.description}</p>
        <div className="search-meta">
          <span>
            <AppIcon name="solar:calendar-mark-bold" size={17} />
            {course.sessionCount} sesi
          </span>
          <span>
            <AppIcon name="bx:coin-stack" size={17} />
            {creditRange(course)}
          </span>
        </div>
      </div>
      <div className="search-actions">
        <button className="primary-button book-button" type="button" onClick={onOpen}>
          {completed ? "Lihat feedback" : "Lihat Detail"}
          <AppIcon name="solar:alt-arrow-right-linear" size={17} />
        </button>
      </div>
    </article>
  );
}

function CourseProgressPanel() {
  return (
    <section className="panel course-progress-panel">
      <h3>Alur Course</h3>
      <div className="course-flow">
        {["Daftar course", "Placement Test", "Pilih mulai sesi", "Pilih tutor dan jadwal", "Project dan sertifikat"].map((step, index) => (
          <div className="course-flow-step" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificatePanel() {
  return (
    <section className="panel course-certificate-panel">
      <div className="certificate-icon" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" className="course-certificate-art">
          <path d="m64 8 2 5 5 2-5 2-2 5-2-5-5-2 5-2ZM12 50l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill="#F1BA36" />
          <rect x="15" y="18" width="49" height="38" rx="6" fill="#E9DEFF" transform="rotate(-9 15 18)" />
          <rect x="15" y="18" width="49" height="38" rx="6" fill="white" stroke="#28245D" strokeWidth="2.5" />
          <path d="M25 29h23M25 36h16M25 43h11" stroke="#A798D6" strokeWidth="3" strokeLinecap="round" />
          <path d="m45 51-3 19 10-5 9 5-3-19" fill="#8C6AE5" stroke="#6550A4" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="51.5" cy="48.5" r="12.5" fill="#F8CB4C" stroke="#D99A20" strokeWidth="2" />
          <path d="m46 49 4 4 7-8" stroke="#28245D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="25" r="2.5" fill="#B49AEA" />
          <circle cx="70" cy="39" r="2" fill="#B49AEA" />
        </svg>
      </div>
      <h3>Sertifikat Course</h3>
      <p>Sertifikat terbuka setelah semua post-test selesai dan final project dinilai.</p>
    </section>
  );
}

function ScheduleSetup({ course, result, enrollment, onSave }) {
  const feedback = useFeedback();
  const { balance } = useTutorData();
  const { profile } = useRoadmapProgress();
  const lockedStart = recommendedCourseStart(course.id, profile);
  const [startStep, setStartStep] = useState(Math.min(enrollment.startStep || lockedStart, lockedStart));
  const [selectedTutor, setSelectedTutor] = useState(enrollment.tutor || "");
  const [selectedDay, setSelectedDay] = useState(enrollment.day || "");
  const tutor = course.tutors.find((item) => item.name === selectedTutor);
  const availableDays = tutor?.availability.days || [];
  const selectedShift = tutor?.availability.shift || "";
  const selectedShiftData = selectedShift ? shiftOptions.find((item) => item.id === selectedShift) : null;
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function clearChoice() {
    setSelectedTutor("");
    setSelectedDay("");
  }

  async function saveSchedule() {
    if (busy || !selectedTutor || !selectedDay || !selectedShiftData) return;
    setBusy(true); setMessage("");
    const selectedTutorData = course.tutors.find((item) => item.name === selectedTutor);
    if (balance < selectedTutorData.creditsCourse) { feedback.credit(balance, selectedTutorData.creditsCourse); setBusy(false); return; }
    try {
    await addBooking({
      tutor: selectedTutor,
      subject: course.title,
      date: nextDateFor(selectedDay),
      time: selectedShiftData.time,
      duration: 120,
      credits: selectedTutorData.creditsCourse,
      courseId: courseFor(course.title) || course.courseId,
      catalogCourseId: course.id,
      startStep,
    });
    onSave({ startStep, tutor: selectedTutor, day: selectedDay, shift: selectedShift, scheduled: true });
    } catch (error) {
      if (isCreditError(error)) feedback.credit(balance, selectedTutorData.creditsCourse);
      else setMessage(error.message || "Jadwal belum tersimpan.");
    }
    finally { setBusy(false); }
  }

  return (
    <section className="course-panel setup-panel">
      <p role="status">{busy ? "Menyimpan jadwal…" : message}</p>
      <div className="course-section-heading">
        <div>
          <span className="course-eyebrow">Setelah Placement Test</span>
          <h2>Atur course kamu</h2>
        </div>
        <span className="course-pill">{placementLevel(result.score)} · {result.score}/100</span>
      </div>
      <div className="setup-grid">
        <div className="setup-step">
          <h3>1. Mulai dari sesi</h3>
          <p>Rekomendasi kompetensi: sesi {lockedStart}. Materi awal hanya dapat dilewati setelah assessment Advanced dan semua prasyaratnya terpenuhi.</p>
          <div className="step-choice-list">
            {course.sessions.map((session, index) => {
              const step = index + 1;
              return (
                <button key={session} type="button" disabled={step > lockedStart} aria-pressed={startStep === step} onClick={() => setStartStep(step)}>
                  <strong>Sesi {step}</strong>
                  <span>{session}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="setup-step">
          <div className="setup-heading-inline">
            <h3>2. Pilih tutor</h3>
            {(selectedTutor || selectedDay || selectedShift) && <button type="button" onClick={clearChoice}>Hapus pilihan</button>}
          </div>
          <div className="setup-choice-list">
            {course.tutors.map((item) => (
              <button key={item.name} type="button" aria-pressed={selectedTutor === item.name} onClick={() => { setSelectedTutor(item.name); setSelectedDay(""); }}>
                <strong>{item.name}</strong>
                <span>{item.rating} ({item.reviews}) / {item.creditsCourse} kredit per course</span>
              </button>
            ))}
          </div>
          <div className="setup-schedule-section">
            <h3>3. Pilih jadwal</h3>
            <p>{tutor ? `Pilih hari belajar bersama ${tutor.name}.` : "Pilih tutor terlebih dahulu untuk melihat hari yang tersedia."}</p>
            {tutor && <div className="setup-choice-list compact">
              {availableDays.map((day) => (
                <button key={day} type="button" aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>
                  {dayMeta[day].label}
                </button>
              ))}
            </div>}
            {selectedShiftData && <p className="selected-shift-note">Jam mentor ini tetap: {selectedShiftData.label}, {selectedShiftData.range}</p>}
            <button className="primary-button setup-submit" type="button" disabled={busy || !selectedTutor || !selectedDay || !selectedShiftData} onClick={saveSchedule}>
              Simpan jadwal course
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseDetail({ course, onBack, onTutorProfile, onStartPreTest, enrollment, onEnroll, onCancelEnrollment, onUpdateEnrollment, onRoadmap }) {
  const feedback = useFeedback();
  const confirmRef = useRef(null);
  const { sessions, balance, courseCompletions = {} } = useTutorData();
  const completion = courseCompletions[course.id];
  const completed = Boolean(completion);
  const learning = courseLearningProgress(course, sessions, enrollment);
  const { allAssessments } = useRoadmapProgress();
  const placementBank = courseFor(course.title) || course.courseId;
  const rawPretest = readAssessment(assessmentKey(course.id, placementBank, "pre"));
  const legacyPretest = placementBank !== course.courseId ? readAssessment(assessmentKey(course.id, course.courseId, "pre")) : null;
  const ownPretest = rawPretest ? assessmentResult(rawPretest, placementBank, "pre") : null;
  const previousPretest = legacyPretest ? assessmentResult(legacyPretest, course.courseId, "pre") : null;
  const reusedPretest = allAssessments.find((assessment) => assessment.bank === placementBank && assessment.mode === "pre");
  const pretestResult = ownPretest || previousPretest || reusedPretest;
  const isEnrolled = enrollment?.registered;

  return (
    <div className="course-detail-layout">
      <div className="course-detail-main">
        <button className="mentor-back" onClick={onBack}>
          <AppIcon name="solar:arrow-left-linear" size={19} />
          Kembali ke katalog course
        </button>

        <section className="course-hero">
          <span className="course-eyebrow">{course.category} / {course.field}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-hero-actions">
            <button className="primary-button" type="button" disabled={isEnrolled || completed} onClick={() => {
              if (balance <= 0) feedback.credit(balance, Math.min(...course.tutors.map((tutor) => tutor.creditsCourse)));
              else confirmRef.current?.showModal();
            }}>
              {completed ? "Course selesai" : isEnrolled ? "Sudah terdaftar" : "Daftar Course"}
              <AppIcon name={isEnrolled ? "solar:check-circle-bold" : "solar:clipboard-list-bold"} size={18} />
            </button>
            {isEnrolled && !completed && (
              <button className="primary-button secondary-action" type="button" disabled={Boolean(pretestResult)} onClick={() => onStartPreTest(course)}>
                {pretestResult ? "Placement Test selesai" : "Mulai Placement Test"}
                <AppIcon name="solar:clipboard-check-bold" size={18} />
              </button>
            )}
            {isEnrolled && !completed && pretestResult && !enrollment?.scheduled && (
              <button className="outline-button cancel-course-button" type="button" onClick={() => onCancelEnrollment(course.id)}>
                Cancel course
              </button>
            )}
          </div>
        </section>

        <CourseCompletionFeedback completion={completion} title={course.title} />
        {isEnrolled && !completed && !pretestResult && (
          <section className="course-panel skill-gap-panel">
            <div>
              <span className="course-eyebrow">Placement Test tersedia</span>
              <h2>Kerjakan Placement Test sebelum pilih jadwal</h2>
              <p>Hasil tes membantu menentukan titik mulai belajar. Setelah selesai, kamu bisa memilih sesi awal, tutor, dan jadwal.</p>
            </div>
            <div className="score-ring pending-score">
              <AppIcon name="solar:lock-keyhole-unlocked-linear" size={38} />
              <span>Ready</span>
            </div>
          </section>
        )}

        {isEnrolled && !completed && pretestResult && (
          <>
          {!ownPretest && <p className="activity-feedback">Hasil Placement Test sebelumnya digunakan kembali. Rekomendasi mulai materi tetap mengikuti kompetensi dan prasyarat, bukan skor total.</p>}
          <ScheduleSetup
            course={course}
            result={pretestResult}
            enrollment={enrollment || {}}
            onSave={(updates) => onUpdateEnrollment(course.id, updates)}
          />
          </>
        )}

        <section className="course-panel">
          <div className="course-section-heading">
            <div>
              <span className="course-eyebrow">Framework materi</span>
              <h2>Roadmap course</h2>
            </div>
            <span className="course-pill">{course.sessionCount} sesi</span>
          </div>
          <div className="course-session-list">
            {course.sessions.map((session, index) => (
              <article className="course-session-item" key={session}>
                <span className="session-number">{index + 1}</span>
                <div>
                  <h3>{session}</h3>
                  <p>{index === course.sessions.length - 1 ? `Project akhir: ${course.project}` : "Ada post-test singkat sebelum lanjut ke materi berikutnya."}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="course-panel" aria-labelledby="course-learning-progress-title">
          <div className="course-section-heading"><div><span className="course-eyebrow">Terhubung ke Career Roadmap</span><h2 id="course-learning-progress-title">Progres belajar saya</h2></div><span className="course-pill">{learning.completedLessons.length}/{course.sessions.length} materi</span></div>
          <div className="progress-track" role="progressbar" aria-label="Materi course dipelajari" aria-valuemin={0} aria-valuemax={100} aria-valuenow={learning.percent}><div className="progress-fill" style={{ width: `${learning.percent}%` }} /></div>
          <LessonProgress course={course} learning={learning} enrollment={enrollment} />
          {onRoadmap && <button className="text-link course-roadmap-return" onClick={onRoadmap}>Lihat Career Roadmap<AppIcon name="career:route" size={17} /></button>}
        </section>

        <section className="course-panel">
          <div className="course-section-heading">
            <div>
              <span className="course-eyebrow">Jadwal tutor</span>
              <h2>Tutor tersedia di course ini</h2>
            </div>
          </div>
          <div className="course-tutor-list">
            {course.tutors.map((tutor) => (
              <article className="course-tutor-card" key={tutor.name}>
                <button className="search-avatar" type="button" onClick={() => onTutorProfile(tutor)} aria-label={`Buka profil ${tutor.name}`}>
                  <TutorPortrait name={tutor.name} />
                </button>
                <div>
                  <h3>{tutor.name}</h3>
                  <p>{tutor.subjects}</p>
                  <div className="search-meta">
                    <span><AppIcon name="solar:star-bold" size={16} /><strong>{tutor.rating}</strong> ({tutor.reviews})</span>
                    <span><AppIcon name="bx:coin-stack" size={16} />{tutor.creditsCourse} kredit / course</span>
                  </div>
                  <p className="tutor-schedule-line">{formatAvailability(tutor)}</p>
                </div>
                <div className="course-tutor-actions">
                  <button className="outline-button" type="button" onClick={() => onTutorProfile(tutor)}>Profil tutor</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <aside className="cari-tutor-side">
        <CourseProgressPanel />
        <CertificatePanel />
      </aside>
      <dialog className="activity-dialog course-confirm-dialog" ref={confirmRef} aria-labelledby="course-confirm-title">
        <div className="activity-dialog-heading">
          <h2 id="course-confirm-title">Daftar course?</h2>
          <button aria-label="Tutup konfirmasi" onClick={() => confirmRef.current?.close()}><AppIcon name="solar:close-circle-linear" size={24} /></button>
        </div>
        <p>Kamu akan terdaftar di {course.title}. Setelah itu Placement Test terbuka, lalu jadwal bisa dipilih setelah tes selesai.</p>
        <div className="test-confirm-actions">
          <button className="activity-outline" type="button" onClick={() => confirmRef.current?.close()}>Batal</button>
          <button className="activity-primary" type="button" onClick={() => { onEnroll(course.id); confirmRef.current?.close(); }}>Ya, daftar</button>
        </div>
      </dialog>
    </div>
  );
}

export default function CariTutor({ onProfile = () => {}, onStartPreTest = () => {}, initialCourseId = "", onRoadmap, searchQuery = "", onClearSearch = () => {} }) {
  const { courseCompletions = {} } = useTutorData();
  const [category, setCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(() => courses.find((course) => course.id === initialCourseId) || null);
  const enrollments = useEnrollments();

  function updateEnrollments(next) {
    saveEnrollments(next);
  }

  function enroll(courseId) {
    updateEnrollments({ ...enrollments, [courseId]: { ...(enrollments[courseId] || {}), registered: true } });
  }

  function updateEnrollment(courseId, updates) {
    updateEnrollments({ ...enrollments, [courseId]: { ...(enrollments[courseId] || {}), registered: true, ...updates } });
  }

  const filteredCourses = useMemo(() => courses.filter((course) => (!category || course.category === category) && courseMatchesSearch(course, searchQuery)), [category, searchQuery]);
  const hasActiveFilter = Boolean(category);

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onTutorProfile={onProfile}
        onStartPreTest={onStartPreTest}
        enrollment={enrollments[selectedCourse.id]}
        onEnroll={enroll}
        onCancelEnrollment={(courseId) => {
          const next = { ...enrollments };
          next[courseId] = { ...next[courseId], registered: false, scheduled: false };
          updateEnrollments(next);
        }}
        onUpdateEnrollment={updateEnrollment}
        onRoadmap={onRoadmap}
      />
    );
  }

  return (
    <div className="cari-tutor-layout">
      <div className="cari-tutor-main">
        {searchQuery && <div className="career-section-heading"><p role="status">{filteredCourses.length} course ditemukan untuk “{searchQuery}”</p><button className="text-link" onClick={onClearSearch}>Hapus kata kunci</button></div>}
        <div className="filter-row course-filter-row" aria-label="Filter course">
          <strong>Filter by</strong>
          <FilterSelect label="Kategori" value={category} onChange={setCategory} options={categoryOptions} />
          {hasActiveFilter && <button className="clear-filter-button" type="button" onClick={() => setCategory("")}>Reset</button>}
        </div>
        <div className="search-tutor-list">
          {filteredCourses.length > 0 ? filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} completed={Boolean(courseCompletions[course.id])} onOpen={() => setSelectedCourse(course)} />
          )) : (
            <div className="empty-state search-empty-state">
              <AppIcon name="solar:magnifer-linear" size={38} />
              <h3>Course tidak ditemukan</h3>
              <p>Coba kata kunci lain atau ubah filter kategori.</p>
              <button className="primary-button" type="button" onClick={() => { setCategory(""); onClearSearch(); }}>Reset Filter</button>
            </div>
          )}
        </div>
      </div>
      <aside className="cari-tutor-side">
        <CourseProgressPanel />
        <CertificatePanel />
      </aside>
    </div>
  );
}
