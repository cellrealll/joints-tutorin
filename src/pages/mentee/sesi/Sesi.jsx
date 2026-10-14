import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { EmptyState } from "../../../components/common/ActivityUI";
import { TeachBanner } from "../dashboard/Dashboard";
import { dateKey, formatDate, useTutorData } from "../../../state/tutorStore";
import "./Sesi.css";
import SessionCalendar from "./SessionCalendar";
import { compareSessionSchedule, endTime, isUpcomingSession, sessionCategory, sessionStatus } from "./sessionUtils";
import JoinSession from "./JoinSession";
import useSessionClock from "./useSessionClock";

export default function Sesi({ setActive, onDetailSession, initialRoleFilter = "Semua" }) {
  const { sessions } = useTutorData();
  const [tab, setTab] = useState("Mendatang");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [selectedDate, setSelectedDate] = useState("");
  useSessionClock();
  const today = dateKey(new Date());
  const roleSessions = sessions.filter((session) => roleFilter === "Semua" || (roleFilter === "Mengajar" ? session.role === "mentor" : session.role !== "mentor"));
  const upcoming = roleSessions.filter(isUpcomingSession);
  const completed = roleSessions.filter((session) => session.status === "Selesai");
  const visible = roleSessions.filter((session) => (tab === "Mendatang" ? isUpcomingSession(session) : tab === "Riwayat" ? !isUpcomingSession(session) && session.status !== "Dibatalkan" : session.status === "Dibatalkan") && (!selectedDate || session.date === selectedDate))
    .sort((a, b) => (tab === "Riwayat" ? -1 : 1) * compareSessionSchedule(a, b));
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const weeklyCompleted = completed.filter((session) => session.date >= dateKey(weekStart) && session.date <= today);

  function selectDate(date, force = false) {
    setSelectedDate(!force && selectedDate === date ? "" : date);
    const events = roleSessions.filter((session) => session.date === date);
    if (events.some(isUpcomingSession)) setTab("Mendatang");
    else if (events.some((session) => session.status !== "Dibatalkan")) setTab("Riwayat");
    else if (events.length) setTab("Dibatalkan");
  }

  return <div className="activity-layout sessions-page">
    <div className="activity-main">
      <section className="sessions-hero"><div><span>Courses Saya</span><h1>Kelola course dan jadwalmu</h1><p>Course terdaftar, jadwal mentor, riwayat belajar, dan konfirmasi mentor dalam satu kalender.</p></div>
        <div className="sessions-count"><strong>{upcoming.length}</strong><span>Jadwal mendatang</span></div>
      </section>
      <div className="sessions-role-filter"><span>Aktivitas saya</span><div className="activity-tabs" aria-label="Filter peran">
        {["Semua", "Belajar", "Mengajar"].map((label) => <button key={label} aria-pressed={roleFilter === label} onClick={() => setRoleFilter(label)}>{label}</button>)}
      </div></div>
      <section className="sessions-content">
        <div className="sessions-section-heading"><div><h2>{tab === "Mendatang" ? "Course Mendatang" : tab === "Riwayat" ? "Riwayat Course" : "Course Dibatalkan"}</h2><p>{visible.length} jadwal {selectedDate ? `pada ${formatDate(selectedDate)}` : "dalam daftar"}</p></div>
          {selectedDate && <button className="sessions-clear-date" onClick={() => setSelectedDate("")}>Semua tanggal<AppIcon name="solar:close-circle-linear" size={16} /></button>}
        </div>
        <div className="activity-tabs" aria-label="Filter course">{["Mendatang", "Riwayat", "Dibatalkan"].map((label) => <button key={label} aria-pressed={tab === label} onClick={() => { setTab(label); setSelectedDate(""); }}>{label}</button>)}</div>
        <div className="sessions-list" key={`${tab}-${selectedDate}-${roleFilter}`}>
          {visible.map((session) => {
            const date = new Date(`${session.date}T00:00:00`);
            return <article className={`sessions-row ${sessionCategory(session)}`} key={session.id} data-role={session.role}>
              <div className="sessions-date"><span>{formatDate(session.date, { weekday: "long", day: undefined, month: undefined, year: undefined })}</span><strong>{date.getDate()}</strong><span>{formatDate(session.date, { day: undefined, month: "short" })}</span></div>
              <div className="sessions-info"><h3>{session.subject}</h3><p>{session.role === "mentor" ? `Mengajar ${session.learner}` : `dengan mentor ${session.tutor}`}</p>
                <div className="sessions-meta"><span className={`sessions-role-badge ${session.role}`}>{session.kind === "industry-mentorship" ? "Industry Mentor / Demo" : session.role === "mentor" ? "Mengajar" : "Belajar"}</span><span className="sessions-time"><AppIcon name="solar:clock-circle-bold" size={13} />{session.time} - {endTime(session)} WIB</span>
                  <span className={`sessions-badge ${sessionStatus(session) === "Terlewat" ? "missed" : session.status === "Menunggu konfirmasi" ? "pending" : session.status === "Dibatalkan" ? "cancelled" : session.status === "Selesai" ? "completed" : "confirmed"}`}>{sessionStatus(session)}</span></div>
              </div>
              <div className="session-actions"><JoinSession session={session} /><button className="activity-outline sessions-detail" onClick={() => onDetailSession(session)}>Detail<AppIcon name="solar:alt-arrow-right-linear" size={17} /></button></div>
            </article>;
          })}
          {!visible.length && <EmptyState title="Belum ada course terjadwal" description={selectedDate ? "Tidak ada jadwal course pada tanggal yang dipilih." : "Course yang sudah kamu daftar dan jadwalkan akan muncul di sini."} />}
        </div>
      </section>
      <div className="activity-banner-footer"><TeachBanner setActive={setActive} /></div>
    </div>
    <aside className="activity-side">
      <SessionCalendar sessions={roleSessions} selectedDate={selectedDate} onSelectDate={selectDate} />
      <section className="activity-panel sessions-progress"><h2>Progres Minggu Ini</h2>
        <div className="sessions-stat-grid"><div><strong>{weeklyCompleted.length}</strong><span>Course selesai</span></div><div><strong>{weeklyCompleted.reduce((sum, session) => sum + session.duration, 0) / 60}</strong><span>Jam belajar</span></div><div><strong>{upcoming.length}</strong><span>Mendatang</span></div></div>
        <div className="progress-track" role="progressbar" aria-label="Target lima sesi per minggu" aria-valuemin={0} aria-valuemax={5} aria-valuenow={Math.min(weeklyCompleted.length, 5)}><div className="progress-fill" style={{ width: `${Math.min(weeklyCompleted.length / 5, 1) * 100}%` }} /></div>
        <p className="activity-muted">{weeklyCompleted.length} dari target 5 jadwal course minggu ini</p>
      </section>
    </aside>
  </div>;
}
