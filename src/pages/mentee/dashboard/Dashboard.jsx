
import AppIcon from "../../../components/common/AppIcon";
import { dateKey, formatDate, useTutorData } from "../../../state/tutorStore";
import { EmptyState } from "../../../components/common/ActivityUI";
import { compareSessionSchedule, endTime, isUpcomingSession, sessionStatus } from "../sesi/sessionUtils";
import JoinSession from "../sesi/JoinSession";
import useSessionClock from "../sesi/useSessionClock";
import { useProfile } from "../../../state/profile";
import useRoadmapProgress from "../career/useRoadmapProgress";
import TutorPortrait from "../../../components/common/TutorPortrait";

function CareerRoadmapEntry({ setActive }) {
  const { career, progress } = useRoadmapProgress();
  return <section className="roadmap-dashboard-entry">
    <AppIcon name="career:route" size={33} />
    <div><h2>Belajar dengan tujuan karier</h2><p>{career.title} · {progress.percent}% milestone selesai{progress.next ? ` · Berikutnya: ${progress.next.title}` : " · Semua milestone tercatat"}</p></div>
    <button className="activity-primary" onClick={() => setActive("Career Roadmap")}>Buka roadmap<AppIcon name="solar:alt-arrow-right-linear" size={16} /></button>
  </section>;
}

function WelcomeBanner({ setActive }) {
  const profile = useProfile();
  return (
    <section className="welcome-banner">
      <div className="welcome-content">
        <h1>
          Halo, <span>{profile.firstName} {profile.lastName}!</span>
        </h1>
        <p>
          Belajar sesuatu yang baru, atau bagikan ilmu yang
          <br className="desktop-break" /> kamu punya?
        </p>
        <div className="welcome-buttons">
          <button
            className="button-yellow"
            onClick={() => setActive("Cari course")}
          >
            <AppIcon name="fa7-solid:search" size={24} />
            Cari course sekarang
          </button>
          <button
            className="button-white"
            onClick={() => setActive("Jadi mentor")}
          >
            <AppIcon name="fluent:hat-graduation-12-regular" size={23} />
            Jadi mentor
          </button>
        </div>
      </div>
      <div className="banner-decoration" aria-hidden="true">
        <AppIcon name="solar:star-bold" size={30} />
        <AppIcon name="solar:book-bookmark-bold" size={72} />
      </div>
    </section>
  );
}

function SectionHeading({ icon, title, action, onAction }) {
  return (
    <div className="section-heading">
      <div className="section-title">
        <AppIcon name={icon} size={38} />
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-link" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function NextSession({ onDetailSession, onJoinSession, setActive }) {
  useSessionClock();
  const { sessions } = useTutorData();
  const session = sessions
    .filter((session) => session.role !== "mentor" && isUpcomingSession(session))
    .sort(compareSessionSchedule)[0];

  return (
    <section className="sessions-section">
      <SectionHeading
        icon="fa7-solid:calendar"
        title="Course berikutnya"
        action="Lihat Semua"
        onAction={() => setActive("Courses")}
      />
      {session ? (
        <article className="session-card">
          <div className="session-avatar">
            <TutorPortrait name={session.tutor} />
          </div>
          <div className="session-info">
            <h3>{session.subject}</h3>
            {sessionStatus(session) === "Sedang sesi" && <span className="dashboard-session-live">● Sedang sesi</span>}
            <p>
              {session.role === "mentor"
                ? `Mengajar ${session.learner}`
                : `Belajar dengan mentor ${session.tutor}`}
            </p>
            <div className="session-meta">
              <span className="meta-pill">
                <AppIcon name="fa7-solid:calendar" size={13} />
                {formatDate(session.date, { weekday: "long" })}
              </span>
              <span className="meta-pill">
                <AppIcon name="solar:clock-circle-bold" size={13} />
                {session.time} - {endTime(session)} WIB
              </span>
            </div>
          </div>
          <div className="session-actions">
            <JoinSession key={session.id} session={session} onJoin={onJoinSession} />
            <button
              className="outline-button session-detail"
              onClick={() => onDetailSession(session)}
            >
              Detail Course
              <AppIcon name="solar:alt-arrow-right-linear" size={20} />
            </button>
          </div>
        </article>
      ) : (
        <EmptyState
          title="Belum ada sesi mendatang"
          description="Daftar course dan pilih jadwal setelah pre-test."
        />
      )}
    </section>
  );
}

const recommendedCourses = [
  {
    id: "uiux-course",
    title: "UI/UX Product Design",
    meta: "7 sesi / Design",
    icon: "solar:notebook-bookmark-bold",
  },
  {
    id: "frontend-course",
    title: "Frontend Web Development",
    meta: "8 sesi / IT",
    icon: "solar:code-bold",
  },
  {
    id: "backend-course",
    title: "Backend API Engineering",
    meta: "8 sesi / IT",
    icon: "solar:server-bold",
  },
  {
    id: "data-course",
    title: "Public Speaking for Work",
    meta: "7 sesi / Communication",
    icon: "solar:microphone-3-bold",
  },
];

function CourseRecommendations({ setActive, onCourseDetail }) {
  const { courseCompletions = {} } = useTutorData();
  return (
    <section className="recommendations-section">
      <SectionHeading
        icon="solar:notebook-bookmark-bold"
        title="Rekomendasi Course"
        action="Lihat Semua"
        onAction={() => setActive("Cari course")}
      />
      <div className="course-grid">
        {recommendedCourses.map((course) => (
          <article className="course-mini-card" key={course.title}>
            <div className="course-mini-icon">
              <AppIcon name={course.icon} size={34} />
            </div>
            <h3>{course.title}</h3>
            {courseCompletions[course.id] && <span className="course-completion-badge">Course selesai</span>}
            <p>{course.meta}</p>
            <button className="primary-button profile-button" onClick={() => onCourseDetail(course.id)}>
              Detail Course
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CreditCard({ onHistory }) {
  const { balance } = useTutorData();
  const target = (Math.floor(balance / 50) + 1) * 50;

  return (
    <section className="panel search-credit-panel">
      <h3>Saldo Kredit</h3>
      <div className="credit-balance">
        <strong>{balance}</strong>
        <span>kredit</span>
      </div>
      <strong className="progress-label">
        {balance}/{target} kredit ke level berikutnya
      </strong>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min((balance / target) * 100, 100)}%` }}
        />
      </div>
      <p className="helper-text">
        {target - balance} kredit lagi ke level berikutnya
      </p>
      <button
        className="primary-button full-button"
        onClick={onHistory}
      >
        Lihat Riwayat Kredit
        <AppIcon name="solar:alt-arrow-right-linear" size={17} />
      </button>
    </section>
  );
}

export function WeeklyProgress() {
  const { transactions } = useTutorData();
  const monday = new Date();
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);

  const weeklyData = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
    (day, index) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + index);
      return {
        day,
        value: transactions
          .filter(
            (item) => item.date === dateKey(date) && item.amount > 0
          )
          .reduce((sum, item) => sum + item.amount, 0),
      };
    }
  );

  const max = Math.max(1, ...weeklyData.map((item) => item.value));
  const earned = weeklyData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="panel search-weekly-panel">
      <h3>Progres Mingguan</h3>
      <strong className="progress-label">{earned}/50 kredit masuk</strong>
      <div className="progress-track weekly-progress">
        <div
          className="progress-fill"
          style={{ width: `${Math.min((earned / 50) * 100, 100)}%` }}
        />
      </div>
      <p className="helper-text">
        {earned >= 50
          ? "Target mingguan tercapai!"
          : `${50 - earned} kredit lagi ke target mingguan`}
      </p>
      <div className="weekly-chart search-weekly-chart">
        <div className="chart-threshold" />
        {weeklyData.map((item) => (
          <div className="chart-column" key={item.day}>
            <div className="bar-area">
              <div
                className={`chart-bar ${item.value >= 30 ? "bar-highlight" : ""}`}
                style={{ height: `${(item.value / max) * 74}px` }}
                title={`${item.value} kredit`}
              />
            </div>
            <span>{item.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TeachBanner({ setActive }) {
  return (
    <section className="teach-banner">
      <div>
        <h2>Dapatkan kredit dengan mengajar!</h2>
        <p>
          Bagikan ilmu yang kamu kuasai dan dapatkan kredit untuk belajar hal baru.
        </p>
      </div>
      <button
        className="button-white teach-banner-button"
        onClick={() => setActive("Jadi mentor")}
      >
        <AppIcon name="fluent:hat-graduation-12-regular" size={23} />
        Jadi mentor
      </button>
    </section>
  );
}

export default function Dashboard({
  setActive,
  onDetailSession = () => setActive("Sesi"),
  onJoinSession,
  onCourseDetail = () => setActive("Cari course"),
}) {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <WelcomeBanner setActive={setActive} />
        <NextSession
          onDetailSession={onDetailSession}
          onJoinSession={onJoinSession}
          setActive={setActive}
        />
        <CourseRecommendations setActive={setActive} onCourseDetail={onCourseDetail} />
        <CareerRoadmapEntry setActive={setActive} />
        <TeachBanner setActive={setActive} />
      </div>
      <aside className="dashboard-right">
        <CreditCard onHistory={() => setActive("Riwayat Kredit")} />
        <WeeklyProgress />
      </aside>
    </div>
  );
}
