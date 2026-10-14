import { useMemo, useRef, useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { addBooking } from "../../../state/tutorStore";
import { assessmentKey, assessmentResult, readAssessment } from "../test/assessmentStorage";

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

const courses = [
  {
    id: "uiux-course",
    courseId: "programming",
    title: "UI/UX Product Design",
    category: "Design",
    field: "Product Design",
    sessionCount: 7,
    description:
      "Belajar riset user, wireframe, prototyping, usability testing, dan handoff ke developer.",
    tutors: [
      {
        name: "Alya Rahmani",
        subjects: "UI/UX Product Design",
        rating: "4.9",
        reviews: "132",
        role: "Senior Designer",
        roleClass: "pro",
        creditsCourse: 72,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Rab", "Kam", "Jum"], shift: "shift-3" },
      },
      {
        name: "Nadia Putri",
        subjects: "Design System",
        rating: "4.8",
        reviews: "98",
        role: "Design Mentor",
        roleClass: "active",
        creditsCourse: 64,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Sel", "Kam", "Sab"], shift: "shift-2" },
      },
    ],
    sessions: [
      "User research dan problem framing",
      "Persona, journey map, dan opportunity area",
      "Information architecture dan user flow",
      "Wireframe low-fidelity",
      "Prototype high-fidelity",
      "Usability testing dan iterasi",
      "Final project product case study dan sertifikat",
    ],
    project: "Membuat end-to-end case study untuk fitur aplikasi digital.",
  },
  {
    id: "frontend-course",
    courseId: "programming",
    title: "Frontend Web Development",
    category: "IT",
    field: "Web Development",
    sessionCount: 8,
    description:
      "Bangun UI responsif dengan HTML, CSS, JavaScript, React, state, API, dan deployment.",
    tutors: [
      {
        name: "Rafi Ahmad",
        subjects: "Frontend Web Development",
        rating: "4.8",
        reviews: "102",
        role: "Frontend Engineer",
        roleClass: "mentor",
        creditsCourse: 82,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Sen", "Rab", "Jum"], shift: "shift-2" },
      },
      {
        name: "Dion Prasetyo",
        subjects: "React Frontend",
        rating: "4.8",
        reviews: "98",
        role: "React Mentor",
        roleClass: "active",
        creditsCourse: 88,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Sel", "Kam", "Min"], shift: "shift-3" },
      },
    ],
    sessions: [
      "HTML semantic dan struktur UI",
      "CSS layout responsif",
      "JavaScript DOM dan event",
      "React component dan props",
      "State, form, dan validasi",
      "API integration",
      "Testing UI ringan",
      "Final project dashboard frontend dan sertifikat",
    ],
    project: "Membuat dashboard frontend dengan data API, filter, dan responsive layout.",
  },
  {
    id: "backend-course",
    courseId: "programming",
    title: "Backend API Engineering",
    category: "IT",
    field: "Backend",
    sessionCount: 8,
    description:
      "Pelajari REST API, autentikasi, database, testing endpoint, dan dokumentasi API.",
    tutors: [
      {
        name: "Bima Ardi",
        subjects: "Backend API Engineering",
        rating: "4.9",
        reviews: "121",
        role: "Backend Engineer",
        roleClass: "pro",
        creditsCourse: 96,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Rab", "Kam", "Jum"], shift: "shift-4" },
      },
      {
        name: "Citra Mandira",
        subjects: "Database dan API",
        rating: "4.8",
        reviews: "110",
        role: "API Mentor",
        roleClass: "active",
        creditsCourse: 90,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Sen", "Sel", "Sab"], shift: "shift-4" },
      },
    ],
    sessions: [
      "HTTP, REST, dan API contract",
      "Node.js server fundamentals",
      "Routing, controller, dan validation",
      "Database schema dan query",
      "Authentication dan authorization",
      "Error handling dan logging",
      "API testing dan Postman collection",
      "Final project production-ready API dan sertifikat",
    ],
    project: "Membangun REST API lengkap dengan auth, database, dan dokumentasi endpoint.",
  },
  {
    id: "data-course",
    courseId: "programming",
    title: "Public Speaking for Work",
    category: "Communication",
    field: "Communication",
    sessionCount: 7,
    description:
      "Latihan struktur bicara, storytelling, presentasi profesional, dan handling Q&A.",
    tutors: [
      {
        name: "Maya Santoso",
        subjects: "Public Speaking",
        rating: "4.7",
        reviews: "87",
        role: "Data Analyst",
        roleClass: "active",
        creditsCourse: 58,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Sen", "Rab", "Jum"], shift: "shift-1" },
      },
      {
        name: "Kevin Wijaya",
        subjects: "Pitching dan Presentation",
        rating: "4.6",
        reviews: "75",
        role: "BI Mentor",
        roleClass: "starter",
        creditsCourse: 62,
        avatar: "ph:user-circle-fill",
        availability: { days: ["Sel", "Kam", "Min"], shift: "shift-2" },
      },
    ],
    sessions: [
      "Confidence dan struktur pesan",
      "Audience analysis",
      "Storytelling untuk presentasi",
      "Slide narrative",
      "Voice, pacing, dan gesture",
      "Handling Q&A",
      "Final project presentasi profesional dan sertifikat",
    ],
    project: "Mempresentasikan ide kerja dengan deck, Q&A, dan rekaman evaluasi.",
  },
];

const categoryOptions = ["IT", "Design", "Communication"];
const enrollmentKey = "tutorin-course-enrollments-v1";

function readEnrollments() {
  try {
    const value = JSON.parse(localStorage.getItem(enrollmentKey));
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function saveEnrollments(value) {
  localStorage.setItem(enrollmentKey, JSON.stringify(value));
}

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

function recommendedStep(score, total) {
  return Math.min(total, Math.max(1, Math.ceil((score / 100) * total)));
}

function FilterSelect({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`filter-select ${value ? "active" : ""} ${open ? "open" : ""}`}>
      <button className="filter-select-trigger" type="button" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(!open)}>
        <span>{value || label}</span>
        <AppIcon name="solar:alt-arrow-down-linear" size={20} />
      </button>
      {open && (
        <div className="filter-menu" role="listbox" aria-label={label}>
          <button className={`filter-option ${!value ? "selected" : ""}`} type="button" role="option" aria-selected={!value} onClick={() => { onChange(""); setOpen(false); }}>
            {label}
          </button>
          {options.map((option) => (
            <button className={`filter-option ${value === option ? "selected" : ""}`} key={option} type="button" role="option" aria-selected={value === option} onClick={() => { onChange(option); setOpen(false); }}>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onOpen }) {
  return (
    <article className="search-course-card">
      <div className="course-icon" aria-hidden="true">
        <AppIcon name="solar:notebook-bookmark-bold" size={50} />
      </div>
      <div className="search-course-info">
        <div className="search-course-title">
          <h2>{course.title}</h2>
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
          Lihat Detail
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
        {["Daftar course", "Pre-test", "Pilih mulai sesi", "Pilih tutor dan jadwal", "Project dan sertifikat"].map((step, index) => (
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
      <div className="certificate-icon">
        <AppIcon name="solar:diploma-verified-bold" size={42} />
      </div>
      <h3>Sertifikat Course</h3>
      <p>Sertifikat terbuka setelah semua post-test selesai dan final project dinilai.</p>
    </section>
  );
}

function ScheduleSetup({ course, result, enrollment, onSave }) {
  const lockedStart = recommendedStep(result.score, course.sessions.length);
  const [startStep, setStartStep] = useState(enrollment.startStep || lockedStart);
  const [selectedTutor, setSelectedTutor] = useState(enrollment.tutor || "");
  const [selectedDay, setSelectedDay] = useState(enrollment.day || "");
  const tutor = course.tutors.find((item) => item.name === selectedTutor);
  const availableDays = tutor?.availability.days || [];
  const selectedShift = tutor?.availability.shift || "";
  const selectedShiftData = selectedShift ? shiftOptions.find((item) => item.id === selectedShift) : null;

  function clearChoice() {
    setSelectedTutor("");
    setSelectedDay("");
  }

  function saveSchedule() {
    if (!selectedTutor || !selectedDay || !selectedShiftData) return;
    const selectedTutorData = course.tutors.find((item) => item.name === selectedTutor);
    addBooking({
      tutor: selectedTutor,
      subject: course.title,
      date: nextDateFor(selectedDay),
      time: selectedShiftData.time,
      duration: 120,
      credits: selectedTutorData.creditsCourse,
      courseId: course.courseId,
      catalogCourseId: course.id,
      startStep,
    });
    onSave({ startStep, tutor: selectedTutor, day: selectedDay, shift: selectedShift, scheduled: true });
  }

  return (
    <section className="course-panel setup-panel">
      <div className="course-section-heading">
        <div>
          <span className="course-eyebrow">Setelah pre-test</span>
          <h2>Atur course kamu</h2>
        </div>
        <span className="course-pill">Skor {result.score}/100</span>
      </div>
      <div className="setup-grid">
        <div className="setup-step">
          <h3>1. Mulai dari sesi</h3>
          <p>Rekomendasi sistem: sesi {lockedStart}. Kamu boleh mundur, tapi belum bisa maju.</p>
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
            {(selectedTutor || selectedDay || selectedShift) && <button type="button" onClick={clearChoice}>Clear choice</button>}
          </div>
          <div className="setup-choice-list">
            {course.tutors.map((item) => (
              <button key={item.name} type="button" aria-pressed={selectedTutor === item.name} onClick={() => { setSelectedTutor(item.name); setSelectedDay(""); }}>
                <strong>{item.name}</strong>
                <span>{item.rating} ({item.reviews}) / {item.creditsCourse} kredit per course</span>
              </button>
            ))}
          </div>
          <h3>3. Pilih jadwal</h3>
          <div className="setup-choice-list compact">
            {availableDays.map((day) => (
              <button key={day} type="button" aria-pressed={selectedDay === day} onClick={() => setSelectedDay(day)}>
                {dayMeta[day].label}
              </button>
            ))}
          </div>
          {selectedShiftData && <p className="selected-shift-note">Jam mentor ini tetap: {selectedShiftData.label}, {selectedShiftData.range}</p>}
          <button className="primary-button setup-submit" type="button" disabled={!selectedTutor || !selectedDay || !selectedShiftData} onClick={saveSchedule}>
            Simpan jadwal course
          </button>
        </div>
      </div>
    </section>
  );
}

function CourseDetail({ course, onBack, onTutorProfile, onStartPreTest, enrollment, onEnroll, onCancelEnrollment, onUpdateEnrollment }) {
  const confirmRef = useRef(null);
  const rawPretest = readAssessment(assessmentKey(course.id, course.courseId, "pre"));
  const pretestResult = rawPretest ? assessmentResult(rawPretest, course.courseId, "pre") : null;
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
            <button className="primary-button" type="button" disabled={isEnrolled} onClick={() => confirmRef.current?.showModal()}>
              {isEnrolled ? "Sudah terdaftar" : "Daftar Course"}
              <AppIcon name={isEnrolled ? "solar:check-circle-bold" : "solar:clipboard-list-bold"} size={18} />
            </button>
            {isEnrolled && (
              <button className="primary-button secondary-action" type="button" disabled={Boolean(pretestResult)} onClick={() => onStartPreTest(course)}>
                {pretestResult ? "Pre-test selesai" : "Mulai Pre-test"}
                <AppIcon name="solar:clipboard-check-bold" size={18} />
              </button>
            )}
            {isEnrolled && pretestResult && !enrollment?.scheduled && (
              <button className="outline-button cancel-course-button" type="button" onClick={() => onCancelEnrollment(course.id)}>
                Cancel course
              </button>
            )}
          </div>
        </section>

        {isEnrolled && !pretestResult && (
          <section className="course-panel skill-gap-panel">
            <div>
              <span className="course-eyebrow">Pre-test terkunci terbuka</span>
              <h2>Kerjakan pre-test sebelum pilih jadwal</h2>
              <p>Setelah pre-test selesai, kamu baru bisa memilih mulai dari sesi berapa, tutor, dan shift jadwal yang tersedia.</p>
            </div>
            <div className="score-ring pending-score">
              <AppIcon name="solar:lock-keyhole-unlocked-linear" size={38} />
              <span>Ready</span>
            </div>
          </section>
        )}

        {isEnrolled && pretestResult && (
          <ScheduleSetup
            course={course}
            result={pretestResult}
            enrollment={enrollment || {}}
            onSave={(updates) => onUpdateEnrollment(course.id, updates)}
          />
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
                  <AppIcon name={tutor.avatar} size={58} />
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
        <p>Kamu akan terdaftar di {course.title}. Setelah itu pre-test terbuka, lalu jadwal bisa dipilih setelah pre-test selesai.</p>
        <div className="test-confirm-actions">
          <button className="activity-outline" type="button" onClick={() => confirmRef.current?.close()}>Batal</button>
          <button className="activity-primary" type="button" onClick={() => { onEnroll(course.id); confirmRef.current?.close(); }}>Ya, daftar</button>
        </div>
      </dialog>
    </div>
  );
}

export default function CariTutor({ onProfile = () => {}, onStartPreTest = () => {}, initialCourseId = "" }) {
  const [category, setCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(() => courses.find((course) => course.id === initialCourseId) || null);
  const [enrollments, setEnrollments] = useState(readEnrollments);

  function updateEnrollments(next) {
    setEnrollments(next);
    saveEnrollments(next);
  }

  function enroll(courseId) {
    updateEnrollments({ ...enrollments, [courseId]: { ...(enrollments[courseId] || {}), registered: true } });
  }

  function updateEnrollment(courseId, updates) {
    updateEnrollments({ ...enrollments, [courseId]: { ...(enrollments[courseId] || {}), registered: true, ...updates } });
  }

  const filteredCourses = useMemo(() => courses.filter((course) => !category || course.category === category), [category]);
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
          delete next[courseId];
          updateEnrollments(next);
        }}
        onUpdateEnrollment={updateEnrollment}
      />
    );
  }

  return (
    <div className="cari-tutor-layout">
      <div className="cari-tutor-main">
        <div className="filter-row course-filter-row" aria-label="Filter course">
          <strong>Filter by</strong>
          <FilterSelect label="Kategori" value={category} onChange={setCategory} options={categoryOptions} />
          {hasActiveFilter && <button className="clear-filter-button" type="button" onClick={() => setCategory("")}>Reset</button>}
        </div>
        <div className="search-tutor-list">
          {filteredCourses.length > 0 ? filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onOpen={() => setSelectedCourse(course)} />
          )) : (
            <div className="empty-state search-empty-state">
              <AppIcon name="solar:magnifer-linear" size={38} />
              <h3>Course tidak ditemukan</h3>
              <p>Coba ubah filter kategori.</p>
              <button className="primary-button" type="button" onClick={() => setCategory("")}>Reset Filter</button>
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
