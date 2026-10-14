import { useState } from "react";
import { cancelSession, formatDate, useTutorData } from "../../../state/tutorStore";
import { endTime, sessionStatus } from "../sesi/sessionUtils";
import JoinSession from "../sesi/JoinSession";
import useSessionClock from "../sesi/useSessionClock";
import { courseFor } from "../test/testData";
import AppIcon from "../../../components/common/AppIcon";
import { booking, tutor } from "../sessionData";
import AssessmentAction from "../test/AssessmentAction";

function TutorSummary({ session }) {
  if (session) return <aside className="booking-side">
    <section className="booking-summary-panel">
      <h2>{session.kind === "industry-mentorship" ? "Industry Mentor / Demo" : session.role === "mentor" ? "Ringkasan Mentee" : "Ringkasan Tutor"}</h2>
      <div className="booking-summary-profile">
        <div className="booking-summary-photo" />
        <div><h3>{session.role === "mentor" ? session.learner : session.tutor}</h3><p>{session.subject}</p>{session.mentorTitle && <p>{session.mentorTitle} / {session.mentorCompany}</p>}</div>
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
          <div className="booking-summary-photo" />
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

export default function DetailSesi({ session: selectedSession, bookingNote = "", onBack, onTeach, onOpenTest }) {
  const { sessions } = useTutorData();
  const session = sessions.find((item) => item.id === selectedSession?.id) || selectedSession;
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

  function handleCancel() {
    try {
      cancelSession(session.id);
      setConfirmCancel(false);
      setMessage(session.kind === "industry-mentorship" ? "Booking mentorship demo dibatalkan. Kredit dikembalikan ke saldo." : "Permintaan sesi berhasil dibatalkan. Tidak ada kredit yang dipotong.");
    } catch { setMessage("Sesi belum dibatalkan. Periksa izin penyimpanan browser."); }
  }

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
              <span className="session-status-pill">
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
              <h3>Catatan untuk tutor</h3>
              <p>{noteText}</p>
            </section>
            {session && <div className="session-detail-actions">
              <JoinSession key={session.id} session={session} />
              {session.status === "Menunggu konfirmasi" && <div className="sessions-cancel">
                {confirmCancel ? <><p>Batalkan permintaan sesi ini?</p><button className="outline-button" onClick={() => setConfirmCancel(false)}>Kembali</button><button className="primary-button" onClick={handleCancel}>Ya, batalkan</button></> : <button className="outline-button" onClick={() => setConfirmCancel(true)}>Batalkan permintaan</button>}
              </div>}
              <p role="status">{message}</p>
            </div>}
          </section>

          {showEvaluation && <section className="session-evaluation-panel">
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
