import TutorPortrait from "../../../components/common/TutorPortrait";
import { useState } from "react";
import { cancelSession, formatDate, saveSessionZoomLink, useTutorData } from "../../../state/tutorStore";
import { endTime, sessionStatus } from "../sesi/sessionUtils";
import JoinSession from "../sesi/JoinSession";
import useSessionClock from "../sesi/useSessionClock";
import { courseFor } from "../test/testData";
import AppIcon from "../../../components/common/AppIcon";
import { booking, tutor } from "../sessionData";
import AssessmentAction from "../test/AssessmentAction";
import CourseCompletionFeedback from "../../../components/common/CourseCompletionFeedback";

function TutorSummary({ session }) {
  if (session) return <aside className="booking-side">
    <section className="booking-summary-panel">
      <h2>{session.kind === "industry-mentorship" ? "Industry Mentor" : session.role === "mentor" ? "Ringkasan Mentee" : "Ringkasan Tutor"}</h2>
      <div className="booking-summary-profile">
        <div className="booking-summary-photo"><TutorPortrait name={session?.role === "mentor" ? session.learner : session?.tutor || tutor.name} /></div>
        <div>
          <div className="booking-summary-title">
            <h3>{session.role === "mentor" ? session.learner : session.tutor}</h3>
            {session.role !== "mentor" && session.tutorBadge && <span>{session.tutorBadge}</span>}
          </div>
          <p>{session.role !== "mentor" && session.tutorSubjects ? session.tutorSubjects : session.subject}</p>
          {session.role !== "mentor" && session.tutorRating && <div className="booking-summary-meta">
            <span><AppIcon name="solar:star-bold" size={15} /><strong>{session.tutorRating}</strong>{session.tutorReviews && ` (${session.tutorReviews} ulasan)`}</span>
          </div>}
          {session.mentorTitle && <p>{session.mentorTitle} / {session.mentorCompany}</p>}
        </div>
      </div>
      <div className="booking-cost"><AppIcon name="bx:coin-stack" size={34} /><div>
        <strong>{session.role === "mentor" ? "Pendapatan sesi" : "Biaya Sesi"}</strong>
        <span>{session.credits} kredit ({session.duration} menit)</span>
      </div></div>
    </section>
  </aside>;
  return (
    <aside className="booking-side">
      <section className="booking-summary-panel">
        <h2>Ringkasan Tutor</h2>

        <div className="booking-summary-profile">
          <div className="booking-summary-photo"><TutorPortrait name={session?.role === "mentor" ? session.learner : session?.tutor || tutor.name} /></div>
          <div>
            <div className="booking-summary-title">
              <h3>{tutor.name}</h3>
              <span>{tutor.badge}</span>
            </div>
            <p>{tutor.subjects}</p>
            <div className="booking-summary-meta">
              <span>
                <AppIcon name="solar:star-bold" size={15} />
                <strong>{tutor.rating}</strong> ({tutor.reviews})
              </span>
              <span>
                <AppIcon name="bx:coin-stack" size={15} />
                {tutor.credits} kredit / sesi
              </span>
            </div>
          </div>
        </div>

        <div className="booking-availability">
          <h3>Ketersediaan</h3>
          {tutor.availability.map(([day, time]) => (
            <div key={day}>
              <span>{day}</span>
              <strong>{time}</strong>
            </div>
          ))}

          <div className="booking-cost">
            <AppIcon name="bx:coin-stack" size={34} />
            <div>
              <strong>Biaya Sesi</strong>
              <span>{tutor.credits} kredit/sesi ({tutor.sessionDurationMinutes} menit)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-help-panel">
        <div>
          <h3>Butuh bantuan?</h3>
          <a href="#">Chat admin Tutor.in</a>
        </div>
        <span>
          <AppIcon name="ic:baseline-whatsapp" size={23} />
          {booking.adminPhone}
        </span>
      </section>
    </aside>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="session-detail-item">
      <AppIcon name={icon} size={25} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function EvaluationItem({ item, buttonLabel, onClick, mode, session }) {
  return (
    <article className="evaluation-item">
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <AssessmentAction sessionId={session?.id || booking.code} subject={session?.subject || booking.topic} courseId={session?.courseId} mode={mode} onClick={onClick} buttonLabel={buttonLabel} buttonClass="primary-button evaluation-button" />
    </article>
  );
}

function TeachBanner({ onTeach }) {
  return (
    <section className="detail-teach-banner">
      <div>
        <h2>Dapatkan kredit dengan mengajar!</h2>
        <p>Bagikan ilmu yang kamu kuasai dan dapatkan kredit untuk belajar hal baru.</p>
      </div>
      <button className="button-white teach-banner-button" type="button" onClick={onTeach}>
        <AppIcon name="fluent:hat-graduation-12-regular" size={23} />
        Jadi tutor
      </button>
    </section>
  );
}

function ZoomSessionPanel({ session }) {
  const [link, setLink] = useState(session.zoomUrl || "");
  const [feedback, setFeedback] = useState("");

  async function saveLink(event) {
    event.preventDefault();
    try {
      await saveSessionZoomLink(session.id, link);
      setFeedback("Link Zoom tersimpan. Klik Mulai sesi agar mentee bisa bergabung.");
    } catch (error) { setFeedback(error.message || "Link Zoom belum tersimpan."); }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(session.zoomUrl); setFeedback("Link Zoom disalin. Bagikan kepada mentee yang memakai perangkat lain."); }
    catch { document.getElementById(`zoom-link-${session.id}`)?.select(); setFeedback("Salin link yang terpilih di kolom menggunakan Ctrl+C."); }
  }

  return <section className="session-zoom-panel" aria-labelledby="session-zoom-title">
    <div className="session-zoom-heading"><span><AppIcon name="solar:videocamera-record-bold" size={22} /></span><div><h3 id="session-zoom-title">Sesi melalui Zoom</h3><p>Siapkan meeting Zoom, simpan link undangan, lalu klik Mulai sesi agar mentee dapat bergabung.</p></div></div>
    <div className="session-zoom-steps"><a className="activity-outline" href="https://zoom.new" target="_blank" rel="noopener noreferrer"><AppIcon name="solar:export-linear" size={18} />1. Buka dan mulai Zoom</a><span>Salin link undangan dari meeting yang terbuka, lalu tempel di bawah.</span></div>
    <form className="session-zoom-form" onSubmit={saveLink}><label htmlFor={`zoom-link-${session.id}`}>2. Link undangan Zoom</label><div><input id={`zoom-link-${session.id}`} type="url" required value={link} onChange={(event) => { setLink(event.target.value); setFeedback(""); }} placeholder="https://zoom.us/j/123456789?pwd=..." autoComplete="url" /><button className="activity-primary" type="submit">Simpan link</button></div></form>
    {session.zoomUrl && <button className="session-zoom-copy" onClick={copyLink}>Salin link untuk mentee</button>}
    <p className="session-zoom-note">Link tersimpan di akun. Mentee dapat bergabung setelah kamu menekan Mulai sesi.</p>
    {feedback && <p className="session-zoom-feedback" role="status">{feedback}</p>}
  </section>;
}

export default function DetailSesi({ session: selectedSession, bookingNote = "", onBack, onTeach, onOpenTest, onJoinSession, dashboardMode = "mentee" }) {
  const { sessions, courseCompletions = {} } = useTutorData();
  const session = sessions.find((item) => item.id === selectedSession?.id) || selectedSession;
  const mentorView = dashboardMode === "mentor" && session?.role === "mentor";
  const forbidden = dashboardMode !== "mentor" && session?.role === "mentor";
  const completion = session?.role !== "mentor" && session?.status === "Selesai" ? courseCompletions[session?.catalogCourseId] : null;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState("");
  useSessionClock();
  const sessionSchedule = session
    ? `${formatDate(session.date, { weekday: "long" })} / ${session.time} - ${endTime(session)} WIB`
    : `${booking.availableDate} / ${booking.initialTime} ${booking.timezone}`;
  const noteText = (session ? session.note || "" : bookingNote).trim() || booking.emptyNote;
  const bookingCode = session
    ? session.bookingCode || session.code || `TTR-${session.date.replaceAll("-", "")}-${session.id.toUpperCase()}`
    : booking.code;
  const showEvaluation = !session || (session.kind !== "industry-mentorship" && session.role !== "mentor" && session.status !== "Dibatalkan" && (session.courseId || courseFor(session.subject)));

  async function handleCancel() {
    try {
      await cancelSession(session.id);
      setConfirmCancel(false);
      setMessage("Sesi dibatalkan. Kredit booking dikembalikan ke saldo.");
    } catch (error) { setMessage(error.message || "Sesi belum dibatalkan. Coba kembali."); }
  }

  if (forbidden) return <section className="alternate-page"><h1>Sesi mengajar</h1><p>Buka dashboard mentor untuk mengelola sesi mengajar ini.</p><button className="primary-button" onClick={onBack}>Kembali</button></section>;

  return (
    <div className="session-detail-page">
      <button className="session-detail-back" type="button" onClick={onBack}>
        <AppIcon name="solar:alt-arrow-left-linear" size={21} />
        Kembali
      </button>

      <div className="session-detail-layout">
        <div className="session-detail-main">
          <section className="session-detail-panel">
            <div className="session-detail-heading">
              <div>
                <h1>Detail Sesi</h1>
                <p>Informasi lengkap booking sesi kamu.</p>
              </div>
              <span className={`session-status-pill ${session && sessionStatus(session) === "Sedang sesi" ? "live" : ""}`}>
                <AppIcon name="solar:clock-circle-bold" size={18} />
                {session ? sessionStatus(session) : booking.status}
              </span>
            </div>

            <h2>Informasi booking</h2>
            {session?.isDemo && <p className="career-demo-note">Booking mentorship simulasi. Tidak ada janji dengan profesional nyata.</p>}

            <div className="session-detail-list">
              <DetailItem icon="solar:ticket-linear" label="Booking ID" value={bookingCode} />
              <DetailItem icon="solar:calendar-linear" label="Jadwal" value={sessionSchedule} />
              <DetailItem icon="solar:book-2-linear" label="Topik sesi" value={session?.subject || booking.topic} />
              <DetailItem icon="solar:card-linear" label="Kredit" value={`${session?.credits ?? tutor.credits} kredit`} />
            </div>

            <section className="session-note-card">
              <h3>{mentorView ? "Catatan dari mentee" : "Catatan untuk tutor"}</h3>
              <p>{noteText}</p>
            </section>
            {mentorView && session?.status === "Dikonfirmasi" && <ZoomSessionPanel key={session.id} session={session} />}
            {session && <div className="session-detail-actions">
              {(session.role !== "mentor" || session.zoomUrl) && <JoinSession key={session.id} session={session} onJoin={onJoinSession} />}
              {session.status === "Menunggu konfirmasi" && <div className="sessions-cancel">
                {confirmCancel ? <><p>Batalkan permintaan sesi ini?</p><button className="outline-button" onClick={() => setConfirmCancel(false)}>Kembali</button><button className="primary-button" onClick={handleCancel}>Ya, batalkan</button></> : <button className="outline-button" onClick={() => setConfirmCancel(true)}>Batalkan permintaan</button>}
              </div>}
              <p role="status">{message}</p>
            </div>}
          </section>

          <CourseCompletionFeedback completion={completion} title={session?.subject} />
          {showEvaluation && !completion && <section className="session-evaluation-panel">
            <div className="session-evaluation-heading">
              <h2>Evaluasi</h2>
              <span>*Wajib</span>
            </div>

            <EvaluationItem session={session} item={booking.preTest} mode="pre" buttonLabel={`Buka ${booking.preTest.title.toLowerCase()}`} onClick={() => onOpenTest("pre")} />
            {(!session || session.status === "Selesai") && <EvaluationItem session={session} item={booking.postTest} mode="post" buttonLabel={`Buka ${booking.postTest.title.toLowerCase()}`} onClick={() => onOpenTest("post")} />}
          </section>}

          <TeachBanner onTeach={onTeach} />
        </div>

        <TutorSummary session={session} />
      </div>
    </div>
  );
}
