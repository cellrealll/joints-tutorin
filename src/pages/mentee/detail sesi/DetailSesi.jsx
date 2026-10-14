import AppIcon from "../../../components/common/AppIcon";
import { booking, tutor } from "../sessionData";
import AssessmentAction from "../test/AssessmentAction";

function TutorSummary() {
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

function EvaluationItem({ item, buttonLabel, onClick, mode }) {
  return (
    <article className="evaluation-item">
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <AssessmentAction sessionId={booking.code} subject={booking.topic} mode={mode} onClick={onClick} buttonLabel={buttonLabel} buttonClass="primary-button evaluation-button" />
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

export default function DetailSesi({ bookingNote, onBack, onTeach, onOpenTest }) {
  const sessionTime = `${booking.initialTime} ${booking.timezone}`;
  const sessionSchedule = `${booking.availableDate} • ${sessionTime}`;
  const noteText = bookingNote.trim() || booking.emptyNote;

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
                {booking.status}
              </span>
            </div>

            <h2>Informasi booking</h2>

            <div className="session-detail-list">
              <DetailItem icon="solar:ticket-linear" label="Booking ID" value={booking.code} />
              <DetailItem icon="solar:calendar-linear" label="Jadwal" value={sessionSchedule} />
              <DetailItem icon="solar:book-2-linear" label="Topik sesi" value={booking.topic} />
              <DetailItem icon="solar:card-linear" label="Kredit" value={`${tutor.credits} kredit`} />
            </div>

            <section className="session-note-card">
              <h3>Catatan untuk tutor</h3>
              <p>{noteText}</p>
            </section>
          </section>

          <section className="session-evaluation-panel">
            <div className="session-evaluation-heading">
              <h2>Evaluasi</h2>
              <span>*Wajib</span>
            </div>

            <EvaluationItem item={booking.preTest} mode="pre" buttonLabel={`Buka ${booking.preTest.title.toLowerCase()}`} onClick={() => onOpenTest("pre")} />
            <EvaluationItem item={booking.postTest} mode="post" buttonLabel={`Buka ${booking.postTest.title.toLowerCase()}`} onClick={() => onOpenTest("post")} />
          </section>

          <TeachBanner onTeach={onTeach} />
        </div>

        <TutorSummary />
      </div>
    </div>
  );
}
