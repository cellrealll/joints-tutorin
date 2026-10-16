
import { useRef, useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { CreditCard, WeeklyProgress, TeachBanner } from "../dashboard/Dashboard";
import "./ProfilMentor.css";
import { addBooking, useTutorData } from "../../../state/tutorStore";
import { isCreditError, useFeedback } from "../../../state/feedbackContext";
import Dropdown from "../../../components/common/Dropdown";
import TutorPortrait from "../../../components/common/TutorPortrait";

const days = ["Sen", "Sel", "Rab", "Kam", "Jum"];

const reviewSamples = [
  {
    name: "Andi Pratama",
    initials: "AP",
    rating: "4.8",
    date: "10 Mei 2025",
    text: "Penjelasan sangat jelas dan mudah dipahami. Mentornya juga sabar banget, recommended!",
  },
  {
    name: "Nadia Putri",
    initials: "NP",
    rating: "5.0",
    date: "8 Mei 2025",
    text: "Belajarnya terarah, latihan soalnya membantu saya memahami materi yang sebelumnya sulit.",
  },
  {
    name: "Raka Aditya",
    initials: "RA",
    rating: "4.9",
    date: "5 Mei 2025",
    text: "Sesi tepat waktu dan semua pertanyaan dijawab dengan detail. Terima kasih!",
  },
];

function ReviewList({ all }) {
  return (
    <div className="mentor-review-list">
      {(all ? reviewSamples : reviewSamples.slice(0, 1)).map((review) => (
        <article className="mentor-review" key={review.name}>
          <span className="mentor-review-avatar" aria-hidden="true">
            {review.initials}
          </span>
          <div>
            <div className="mentor-review-heading">
              <strong>{review.name}</strong>
              <time>{review.date}</time>
            </div>
            <span className="mentor-review-rating">
              <AppIcon name="solar:star-bold" size={14} />
              {review.rating}
            </span>
            <p>{review.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ProfilMentor({
  tutor,
  setActive,
  backPage = "Beranda",
  onBack,
}) {
  const [tab, setTab] = useState("Ringkasan");
  const feedback = useFeedback();
  const { balance } = useTutorData();
  const [message, setMessage] = useState("");
  const dialogRef = useRef(null);
  const subjects = tutor?.subjects
    ? tutor.subjects.split(/\s*(?:·|-|,)\s*/)
    : [""];
  const [bookingSubject, setBookingSubject] = useState(subjects[0]);
  const [bookingTime, setBookingTime] = useState("09:00");

  // Mencegah halaman error jika profil dibuka tanpa data mentor.
  if (!tutor) {
    return (
      <section className="alternate-page">
        <div className="alternate-icon">
          <AppIcon name="fluent:hat-graduation-12-regular" size={42} />
        </div>
        <h1>Profil Mentor</h1>
        <p>Pilih mentor terlebih dahulu untuk melihat detail profilnya.</p>
        <button
          className="primary-button"
          onClick={() => (onBack ? onBack() : setActive?.(backPage))}
        >
          <AppIcon name="solar:alt-arrow-left-linear" size={18} />
          Kembali
        </button>
      </section>
    );
  }

  const skills =
    tutor.name === "Angela Wilkins"
      ? ["Frontend Web Development", "Backend API Engineering", "Public Speaking"]
      : subjects;
  const tabs = ["Ringkasan", "Keahlian", `Ulasan (${tutor.reviews})`, "Tentang"];

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function goBack() {
    if (onBack) {
      onBack();
    } else if (setActive) {
      setActive(backPage);
    }
  }

  function openDialog() {
    dialogRef.current?.showModal();
  }

  async function bookSession(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const date = form.get("date");
    const day = new Date(`${date}T00:00:00`).getDay();

    if (day === 0 || day === 6) {
      event.currentTarget.elements.date.setCustomValidity(
        "Pilih hari Senin sampai Jumat sesuai ketersediaan mentor."
      );
      event.currentTarget.elements.date.reportValidity();
      return;
    }

    try {
      const required = tutor.creditsCourse || tutor.credits;
      if (balance < required) { dialogRef.current?.close(); feedback.credit(balance, required); return; }
      await addBooking({
        tutor: tutor.name,
        subject: form.get("subject"),
        date,
        time: form.get("time"),
        credits: tutor.creditsCourse || tutor.credits,
      });

      dialogRef.current?.close();
      setMessage(
        `Permintaan booking dengan ${tutor.name} tersimpan di server untuk ${date}, pukul ${form.get("time")} WIB.`
      );
      formElement.reset();
    } catch (error) {
      if (isCreditError(error)) { dialogRef.current?.close(); feedback.credit(balance, tutor.creditsCourse || tutor.credits); return; }
      setMessage(
        error.message || "Permintaan booking belum tersimpan. Coba kembali."
      );
    }
  }

  return (
    <div className="mentor-layout">
      <div className="mentor-main">
        <button className="mentor-back" onClick={goBack}>
          <AppIcon name="solar:arrow-left-linear" size={19} />
          Kembali
        </button>

        <section className="mentor-overview" aria-label="Profil mentor">
          <div className="mentor-avatar">
            <TutorPortrait name={tutor.name} />
          </div>

          <div className="mentor-identity">
            <div className="mentor-name">
              <h1>{tutor.name}</h1>
              <span className={`tutor-badge ${tutor.roleClass}`}>
                {tutor.role}
              </span>
            </div>
            <p>{tutor.subjects}</p>

            <div className="mentor-meta">
              <span>
                <AppIcon name="solar:star-bold" size={18} />
                <strong>{tutor.rating}</strong>
                <span>({tutor.reviews})</span>
              </span>
              <span>
                <AppIcon name="bx:coin-stack" size={18} />
                {tutor.creditsCourse || tutor.credits} kredit / course
              </span>
            </div>
          </div>

          <div className="mentor-overview-actions">
            <button className="mentor-primary" onClick={openDialog}>
              Booking Course
            </button>
          </div>
        </section>

        <p className="mentor-status" role="status">
          {message}
        </p>

        <div className="mentor-tabs" role="tablist" aria-label="Informasi mentor">
          {tabs.map((label, index) => (
            <button
              key={label}
              role="tab"
              id={`mentor-tab-${index}`}
              aria-selected={tab === label}
              aria-controls="mentor-tab-content"
              tabIndex={tab === label ? 0 : -1}
              onKeyDown={(event) => {
                const offset =
                  event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0;

                if (offset || event.key === "Home" || event.key === "End") {
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : (index + offset + tabs.length) % tabs.length;

                  setTab(tabs[next]);
                  document.getElementById(`mentor-tab-${next}`)?.focus();
                }
              }}
              onClick={() => setTab(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          id="mentor-tab-content"
          role="tabpanel"
          aria-labelledby={`mentor-tab-${tabs.indexOf(tab)}`}
        >
          {(tab === "Ringkasan" || tab === "Keahlian") && (
            <div className="mentor-info-grid">
              <div className="mentor-info-left">
                <section className="mentor-panel mentor-skills">
                  <h2>Keahlian</h2>
                  <div className="mentor-skill-tags">
                    {(tab === "Ringkasan" ? skills.slice(0, 2) : skills).map(
                      (skill) => (
                        <span key={skill}>{skill}</span>
                      )
                    )}
                  </div>
                  {tab === "Keahlian" && (
                    <p>
                      Pembelajaran privat sesuai kebutuhan course, dengan latihan
                      praktik dan review hasil kerja.
                    </p>
                  )}
                </section>

                <section className="mentor-panel">
                  <h2>Pengalaman</h2>
                  <ul className="mentor-experience">
                    <li>3+ tahun mentoring project dan portofolio</li>
                    <li>Mendampingi simulasi kerja dan review deliverable</li>
                    <li>Menyusun latihan sesuai skill gap mentee</li>
                  </ul>
                </section>
              </div>

              <section className="mentor-panel mentor-availability">
                <h2>Ketersediaan</h2>
                <dl>
                  {days.map((day) => (
                    <div key={day}>
                      <dt>{day}</dt>
                      <dd>09:00 - {day === "Jum" ? "16:00" : "17:00"}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mentor-session-cost">
                  <AppIcon name="bx:coin-stack" size={34} />
                  <div>
                    <strong>Biaya Course</strong>
                    <p>{tutor.creditsCourse || tutor.credits} kredit/course</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {(tab === "Ringkasan" || tab.startsWith("Ulasan")) && (
            <section className="mentor-panel mentor-reviews">
              <div className="mentor-panel-heading">
                <h2>{tab === "Ringkasan" ? "Ulasan Terbaru" : "Ulasan Mentee"}</h2>
                {tab === "Ringkasan" && (
                  <button onClick={() => setTab(tabs[2])}>Lihat Semua</button>
                )}
              </div>
              <ReviewList all={tab !== "Ringkasan"} />
            </section>
          )}

          {tab === "Tentang" && (
            <section className="mentor-panel mentor-about">
              <h2>Tentang {tutor.name}</h2>
              <p>
                Saya membantu kamu memahami {subjects.join(" dan ")} melalui
                pembelajaran yang terarah dan sesuai kebutuhanmu.
              </p>
              <p>
                Setiap pertemuan berfokus pada praktik, diskusi, dan review
                output. Kamu dapat membawa project atau pertanyaan yang ingin
                dibahas bersama.
              </p>
              <dl>
                <div>
                  <dt>Bahasa pengantar</dt>
                  <dd>Bahasa Indonesia</dd>
                </div>
                <div>
                  <dt>Format belajar</dt>
                  <dd>Privat online, berbasis jadwal course</dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        <div className="mentor-teach">
          <TeachBanner setActive={setActive} />
        </div>
      </div>

      <aside className="mentor-right" aria-label="Kredit dan progres belajar">
        <CreditCard onHistory={() => setActive("Riwayat Kredit")} />
        <WeeklyProgress />
      </aside>

      <dialog
        className="mentor-dialog"
        ref={dialogRef}
        aria-labelledby="mentor-dialog-title"
      >
        <div className="mentor-dialog-heading">
          <h2 id="mentor-dialog-title">Booking Course</h2>
          <button
            aria-label="Tutup"
            title="Tutup"
            onClick={() => dialogRef.current?.close()}
          >
            <AppIcon name="solar:close-circle-linear" size={25} />
          </button>
        </div>

        <form onSubmit={bookSession}>
          <p>
            {tutor.name} / {tutor.creditsCourse || tutor.credits} kredit per course
          </p>

          <label htmlFor="mentor-book-subject">Course</label>
          <Dropdown
            name="subject"
            id="mentor-book-subject"
            value={bookingSubject}
            onChange={setBookingSubject}
            options={subjects.map((subject) => ({
              value: subject,
              label: subject,
            }))}
          />

          <label htmlFor="mentor-book-date">Tanggal</label>
          <input
            required
            type="date"
            name="date"
            id="mentor-book-date"
            min={minDate}
            onChange={(event) => event.target.setCustomValidity("")}
          />

          <label htmlFor="mentor-book-time">Jam (WIB)</label>
          <Dropdown
            name="time"
            id="mentor-book-time"
            value={bookingTime}
            onChange={setBookingTime}
            options={["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"].map(
              (time) => ({ value: time, label: time })
            )}
          />

          <p className="mentor-book-note">
            Jadwal mengikuti shift mentor yang tersedia.
          </p>
          <button className="mentor-primary" type="submit">
            Ajukan booking
            <AppIcon name="solar:alt-arrow-right-linear" size={18} />
          </button>
        </form>
      </dialog>
    </div>
  );
}
