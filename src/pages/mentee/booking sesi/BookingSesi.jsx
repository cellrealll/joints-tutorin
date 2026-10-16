import { Fragment, useMemo, useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { booking, bookingDateLabel, calendarDays, timeSlots, tutor, weekdays } from "../sessionData";
import { addBooking, useTutorData } from "../../../state/tutorStore";
import { isCreditError, useFeedback } from "../../../state/feedbackContext";
import TutorPortrait from "../../../components/common/TutorPortrait";

function BookingStepper({ step, complete }) {
  const steps = ["Pilih Jadwal", "Tinjau Rincian", "Konfirmasi"];

  return (
    <div className="booking-stepper" aria-label="Tahap booking">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = step >= stepNumber;

        return (
          <Fragment key={label}>
            <div className="booking-step-item">
              <span className={`booking-step-dot ${isActive ? "active" : ""}`}>
                {complete && stepNumber === 3 ? <AppIcon name="solar:check-bold" size={15} /> : stepNumber}
              </span>
              <strong className={isActive ? "active" : ""}>{label}</strong>
            </div>
            {index < steps.length - 1 && (
              <span className={`booking-step-line ${step > stepNumber ? "active" : ""}`} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function ScheduleStep({ selectedDay, selectedTime, onDayChange, onTimeChange }) {
  return (
    <>
      <header className="booking-panel-heading">
        <h1>Pilih Jadwal Sesi</h1>
        <p>Pilih waktu yang sesuai denganmu. Semua waktu ditampilkan dalam zona waktumu.</p>
      </header>

      <div className="booking-schedule-grid">
        <section className="booking-calendar" aria-label={`Kalender ${booking.monthLabel}`}>
          <h2>{booking.monthLabel}</h2>
          <div className="booking-weekdays">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="booking-days">
            {calendarDays.map((day, index) => (
              <button
                className={`${day.muted ? "muted" : ""} ${day.label === selectedDay && !day.muted ? "selected" : ""}`}
                disabled={day.muted}
                key={`${day.label}-${index}`}
                type="button"
                onClick={() => onDayChange(day.label)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </section>

        <section className="booking-times" aria-label="Waktu tersedia">
          <h2>Waktu Tersedia</h2>
          <p>{bookingDateLabel(selectedDay)}</p>

          <div className="booking-time-list">
            {timeSlots.map((slot) => (
              <button
                className={slot === selectedTime ? "selected" : ""}
                key={slot}
                type="button"
                onClick={() => onTimeChange(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ReviewStep({ selectedDay, bookingNote, onBookingNoteChange, remainingCredits, selectedTime }) {
  return (
    <>
      <header className="booking-panel-heading compact">
        <h1>Tinjau Rincian Sesi</h1>
        <p>Pastikan detail tutor, jadwal, dan kredit sudah sesuai sebelum melanjutkan konfirmasi.</p>
      </header>

      <section className="booking-review-card">
        <div className="booking-avatar"><TutorPortrait name={tutor.name} /></div>
        <div>
          <div className="booking-review-title">
            <h2>{tutor.name}</h2>
            <span>{tutor.badge}</span>
          </div>
          <p>{tutor.subjects}</p>
          <div className="booking-mini-meta">
            <span>
              <AppIcon name="solar:star-bold" size={13} />
              {tutor.rating} ({tutor.reviews})
            </span>
            <span>
              <AppIcon name="bx:coin-stack" size={13} />
              {tutor.credits} kredit / sesi
            </span>
          </div>
        </div>
      </section>

      <div className="booking-detail-grid">
        <section>
          <AppIcon name="solar:calendar-linear" size={20} />
          <span>Jadwal</span>
          <strong>{bookingDateLabel(selectedDay)}</strong>
          <p>{selectedTime} {booking.timezone}</p>
        </section>
        <section>
          <AppIcon name="solar:card-linear" size={20} />
          <span>Kredit</span>
          <strong>{tutor.credits} kredit</strong>
          <p>Sisa setelah booking: {remainingCredits} kredit</p>
        </section>
      </div>

      <section className="booking-note">
        <label htmlFor="booking-note">Catatan untuk tutor</label>
        <textarea
          id="booking-note"
          placeholder={booking.notePlaceholder}
          value={bookingNote}
          onChange={(event) => onBookingNoteChange(event.target.value)}
        />
      </section>
    </>
  );
}

function ConfirmationStep({ complete, session }) {
  if (complete) {
    return (
      <>
        <section className="booking-success-hero">
          <AppIcon name="solar:check-circle-linear" size={68} />
          <h1>Permintaan booking tersimpan</h1>
          <p>Jadwal telah diajukan dan menunggu konfirmasi tutor.</p>
          <span>
            <AppIcon name="solar:info-circle-linear" size={15} />
            Detail booking tersimpan di halaman sesi.
          </span>
        </section>

        <section className="booking-code-card">
          <div>
            <span>Kode Booking</span>
            <strong>{session?.id || booking.code}</strong>
          </div>
          <span>{booking.status}</span>
        </section>

        <p className="booking-footnote">
          <AppIcon name="solar:info-circle-linear" size={15} />
          Tutor akan mengonfirmasi maksimal 1 x 24 jam setelah booking.
        </p>
      </>
    );
  }

  return (
    <>
      <header className="booking-panel-heading compact">
        <h1>Konfirmasi</h1>
        <p>Lakukanlah konfirmasi untuk membuat jadwal tutoring.</p>
      </header>

      <section className="booking-confirm-card">
        <AppIcon name="solar:clock-circle-linear" size={64} />
        <h2>Booking siap untuk dikonfirmasi</h2>
        <p>Klik tombol konfirmasi untuk mengonfirmasi booking sesi.</p>
        <span>
          <AppIcon name="solar:info-circle-linear" size={15} />
          Booking dapat dibatalkan selama masih menunggu konfirmasi tutor.
        </span>
      </section>
    </>
  );
}

function TutorSummary() {
  return (
    <aside className="booking-side">
      <section className="booking-summary-panel">
        <h2>Ringkasan Tutor</h2>

        <div className="booking-summary-profile">
          <div className="booking-summary-photo"><TutorPortrait name={tutor.name} /></div>
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

function TeachBanner({ onTeach }) {
  return (
    <section className="booking-teach-banner">
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

export default function BookingSesi({
  bookingNote,
  onBack,
  onBookingNoteChange,
  onSessionDetail,
  onHome,
  onTeach,
}) {
  const [step, setStep] = useState(1);
  const feedback = useFeedback();
  const [complete, setComplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(booking.selectedDay);
  const [selectedTime, setSelectedTime] = useState(booking.initialTime);
  const { balance } = useTutorData();
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const remainingCredits = balance - tutor.credits;

  const primaryLabel = useMemo(() => {
    if (complete) return "Lihat Sesi";
    return step === 3 ? "Konfirmasi" : "Lanjutkan";
  }, [complete, step]);

  function handleNext() {
    if (complete) {
      onSessionDetail(session);
      return;
    }

    if (step === 3) {
      if (balance < tutor.credits) { feedback.credit(balance, tutor.credits); return; }
      setShowConfirmDialog(true);
      return;
    }

    setStep((currentStep) => currentStep + 1);
  }

  function handleBack() {
    if (complete) {
      onHome();
      return;
    }

    if (step === 1) {
      onBack();
      return;
    }

    setStep((currentStep) => currentStep - 1);
  }

  async function confirmBooking() {
    if (busy) return;
    if (balance < tutor.credits) { setShowConfirmDialog(false); feedback.credit(balance, tutor.credits); return; }
    setBusy(true); setMessage("");
    try {
      const value = await addBooking({ tutor: tutor.name, subject: tutor.subjects,
        date: `${booking.month}-${selectedDay.padStart(2, "0")}`,
        time: selectedTime.slice(0, 5), note: bookingNote });
      setSession(value); setShowConfirmDialog(false); setComplete(true);
    } catch (error) {
      if (isCreditError(error)) { setShowConfirmDialog(false); feedback.credit(balance, tutor.credits); }
      else setMessage(error.message || "Booking belum tersimpan.");
    }
    finally { setBusy(false); }
  }

  return (
    <div className="booking-page">
      <div className="booking-layout">
        <div className="booking-main">
          <section className="booking-panel">
            <BookingStepper step={step} complete={complete} />

            {step === 1 && (
              <ScheduleStep
                selectedDay={selectedDay}
                selectedTime={selectedTime}
                onDayChange={setSelectedDay}
                onTimeChange={setSelectedTime}
              />
            )}
            {step === 2 && (
              <ReviewStep
                selectedDay={selectedDay}
                bookingNote={bookingNote}
                onBookingNoteChange={onBookingNoteChange}
                remainingCredits={remainingCredits}
                selectedTime={selectedTime}
              />
            )}
            {step === 3 && <ConfirmationStep complete={complete} session={session} />}
            <p role="status">{message}</p>

            <div className="booking-panel-actions">
              <button className="booking-back-button" type="button" onClick={handleBack}>
                <AppIcon name="solar:alt-arrow-left-linear" size={20} />
                {complete ? "Beranda" : "Kembali"}
              </button>

              <button className="primary-button booking-next-button" type="button" onClick={handleNext}>
                {primaryLabel}
                <AppIcon name="solar:alt-arrow-right-linear" size={20} />
              </button>
            </div>
          </section>

          <TeachBanner onTeach={onTeach} />
        </div>

        <TutorSummary />
      </div>

      {showConfirmDialog && (
        <div className="booking-modal-backdrop" role="presentation">
          <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-booking-title">
            <button className="booking-modal-close" type="button" aria-label="Tutup" onClick={() => setShowConfirmDialog(false)}>
              <AppIcon name="solar:close-circle-linear" size={22} />
            </button>
            <AppIcon className="booking-modal-icon" name="solar:info-circle-linear" size={64} />
            <h2 id="confirm-booking-title">Yakin ingin mengonfirmasi booking?</h2>
            <p>Pastikan jadwal dan tutor sudah sesuai. Setelah dikonfirmasi, booking akan diproses dan kredit akan terpakai.</p>
            <span>
              <AppIcon name="solar:danger-triangle-linear" size={16} />
              Booking dapat dibatalkan sebelum tutor mengonfirmasi.
            </span>
            <div>
              <button className="primary-button" type="button" disabled={busy} onClick={confirmBooking}>{busy ? "Menyimpan…" : "Ya, Konfirmasi"}</button>
              <p role="status">{message || (balance < tutor.credits ? "Kredit belum cukup." : "")}</p>
              <button className="booking-cancel-button" type="button" onClick={() => setShowConfirmDialog(false)}>Batal</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
