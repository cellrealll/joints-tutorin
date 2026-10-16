import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { EmptyState } from "../../../components/common/ActivityUI";
import { demoIndustryMentors, industrySlots, mentorshipCategories } from "../../../state/careerDemoData";
import { bookIndustryMentorship, formatDate, useTutorData } from "../../../state/tutorStore";
import { isUpcomingSession } from "../sesi/sessionUtils";
import useSessionClock from "../sesi/useSessionClock";
import { CareerHero, CareerPage } from "./CareerUI";

function IndustryPortrait({ mentor }) {
  return <img className="industry-portrait" src={mentor.photo} alt="" loading="lazy" />;
}

function IndustryProfile({ mentor, initialCategory, onBack, setActive, onOpenSession }) {
  const { balance } = useTutorData();
  const now = useSessionClock();
  const [category, setCategory] = useState(mentor.categories.includes(initialCategory) ? initialCategory : mentor.categories[0]);
  const [slotId, setSlotId] = useState("");
  const [note, setNote] = useState("");
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState(null);
  const slots = industrySlots(mentor, now);
  const chosen = slots.find((slot) => slot.id === slotId);
  function confirm() {
    try { const session = bookIndustryMentorship({ mentorId: mentor.id, category, slotId, note }); setBooked(session); setMessage("Booking contoh tersimpan. Kredit berkurang dan akan kembali jika sesi dibatalkan."); }
    catch (error) { setMessage(error.message || "Booking belum tersimpan. Coba kembali."); setReview(false); }
  }
  return <><button className="text-link" onClick={onBack}>Kembali ke Industry Mentors</button><div className="industry-profile"><section className="activity-panel"><div className="industry-mentor-identity"><IndustryPortrait mentor={mentor} /><div><span className="career-badge green">Industry Mentor</span><h1>{mentor.name}</h1><p>{mentor.title} / {mentor.company}</p></div></div><p className="career-explainer">{mentor.bio}</p><div><h2>Professional experience</h2><p className="career-explainer">{mentor.experience}</p><span className="career-badge">{mentor.industry}</span></div><div><h2>Areas of expertise</h2><div className="roadmap-skill-tags">{mentor.expertise.map((skill) => <span key={skill}>{skill}</span>)}</div></div><div><h2>Mentoring options</h2><div className="roadmap-skill-tags">{mentor.categories.map((item) => <span key={item}>{item}</span>)}</div></div><div><h2>Reviews & ratings</h2><p className="career-explainer">Belum ada ulasan untuk profil ini.</p></div><button className="activity-outline" onClick={() => setActive("Career Portfolio")}>Buka portfolio saya</button></section>
    <section className="activity-panel"><div className="career-section-heading"><h2>{booked ? "Booking tersimpan" : "Book a mentoring session"}</h2><span className="career-badge green">{mentor.credits} kredit / 60 menit</span></div><p className="career-explainer">Saldo: {balance} kredit</p><p className="activity-feedback" role="status">{message}</p>
      {booked ? <><div className="industry-review"><strong>{booked.subject}</strong><p>{formatDate(booked.date)} / {booked.time} WIB</p><p>Menunggu konfirmasi</p></div><button className="activity-primary" onClick={() => onOpenSession(booked)}>Lihat detail sesi</button><button className="activity-outline" onClick={() => setActive("Courses")}>Semua jadwal saya</button></> : <form className="career-form" aria-label="Mentorship booking" onSubmit={(event) => { event.preventDefault(); setReview(true); setMessage(""); }}><label>Mentoring category<select value={category} onChange={(event) => { setCategory(event.target.value); setReview(false); }}>{mentor.categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Available schedule (WIB)<select required value={slotId} onChange={(event) => { setSlotId(event.target.value); setReview(false); }}><option value="">Pilih jadwal</option>{slots.map((slot) => <option key={slot.id} value={slot.id}>{formatDate(slot.date, { weekday: "short" })} / {slot.time} WIB</option>)}</select></label><label>Fokus diskusi / catatan<textarea maxLength={1200} value={note} onChange={(event) => { setNote(event.target.value); setReview(false); }} placeholder="Contoh: review case study atau latihan interview frontend." /></label>
        {balance < mentor.credits && <div className="career-demo-note">Kredit belum cukup.<button className="text-link" type="button" onClick={() => setActive("Shop")}>Isi kredit</button></div>}
        {review && chosen ? <div className="industry-review"><h3>Tinjau booking</h3><dl><div><dt>Mentor</dt><dd>{mentor.name}</dd></div><div><dt>Kategori</dt><dd>{category}</dd></div><div><dt>Jadwal</dt><dd>{formatDate(chosen.date)} / {chosen.time} WIB</dd></div><div><dt>Durasi</dt><dd>60 menit</dd></div><div><dt>Kredit</dt><dd>{mentor.credits} kredit</dd></div><div><dt>Sisa setelah booking</dt><dd>{balance - mentor.credits} kredit</dd></div></dl><p>Booking contoh ini tersimpan di browser dan belum menghubungkanmu dengan mentor. Kredit kembali jika sesi dibatalkan.</p><div className="career-actions"><button className="activity-primary" type="button" disabled={balance < mentor.credits} onClick={confirm}>Konfirmasi booking</button><button className="text-link" type="button" onClick={() => setReview(false)}>Ubah pilihan</button></div></div> : <button className="activity-primary" type="submit" disabled={!chosen || balance < mentor.credits}>Tinjau sesi & kredit</button>}
      </form>}
    </section></div></>;
}

export default function IndustryMentorship({ setActive, onOpenSession, initialCategory = "Career Consultation" }) {
  const { sessions } = useTutorData();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState("");
  const now = useSessionClock();
  const mentors = demoIndustryMentors.filter((mentor) => `${mentor.name} ${mentor.title} ${mentor.expertise.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (!industry || mentor.industry === industry) && (!category || mentor.categories.includes(category)));
  const upcoming = sessions.filter((session) => session.kind === "industry-mentorship" && isUpcomingSession(session));
  return <CareerPage active="Industry Mentorship" setActive={setActive}><CareerHero title="Industry Mentorship" text="Belajar skill bersama peer tutor. Diskusikan arah karier dan persiapan profesional melalui pengalaman mentorship." icon="career:users" tone="green" /><div className="career-demo-note"><AppIcon name="career:bulb" size={21} />Profil dan jadwal di halaman ini adalah contoh. Booking tersimpan di browser dan belum menghubungkanmu dengan mentor.</div>
    {selected ? <IndustryProfile key={selected.id} mentor={selected} initialCategory={category || initialCategory} onBack={() => setSelected(null)} setActive={setActive} onOpenSession={onOpenSession} /> : <>
      <section className="career-filters" aria-label="Filter industry mentors"><label>Cari mentor<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, peran, atau keahlian" /></label><label>Industry specialization<select value={industry} onChange={(event) => setIndustry(event.target.value)}><option value="">Semua industri</option>{[...new Set(demoIndustryMentors.map((mentor) => mentor.industry))].map((item) => <option key={item}>{item}</option>)}</select></label><label>Mentoring category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Semua kategori</option>{mentorshipCategories.map((item) => <option key={item}>{item}</option>)}</select></label><button className="activity-outline" onClick={() => { setQuery(""); setIndustry(""); setCategory(""); }}>Reset</button></section>
      <div className="career-cards">{mentors.map((mentor) => <article className="industry-mentor-card" key={mentor.id}><div className="industry-mentor-identity"><IndustryPortrait mentor={mentor} /><div><span className="career-badge green">Industry Mentor</span><h2>{mentor.name}</h2><p>{mentor.title}<br />{mentor.company}</p></div></div><p>{mentor.experience} / {mentor.industry}</p><div className="roadmap-skill-tags">{mentor.expertise.map((skill) => <span key={skill}>{skill}</span>)}</div><p>{industrySlots(mentor, now).length} jadwal tersedia / {mentor.credits} kredit per sesi</p><div className="career-actions"><button className="activity-primary" onClick={() => { setSelected(mentor); window.scrollTo({ top: 0, behavior: "instant" }); }}>Lihat profil & jadwal</button></div></article>)}</div>{!mentors.length && <EmptyState title="Mentor tidak ditemukan" description="Coba keahlian atau kategori lainnya." />}
      <section className="activity-panel"><div className="career-section-heading"><h2>Upcoming mentorship sessions</h2><button className="text-link" onClick={() => setActive("Courses")}>Semua sesi</button></div>{upcoming.length ? upcoming.map((session) => <article className="portfolio-experience" key={session.id}><h3>{session.category} / {session.tutor}</h3><p>{formatDate(session.date)} / {session.time} WIB / {session.status}</p><button className="activity-outline" onClick={() => onOpenSession(session)}>Detail sesi</button></article>) : <EmptyState title="Belum ada mentorship terjadwal" description="Pilih kategori dan jadwal untuk mencoba booking." />}</section>
    </>}
  </CareerPage>;
}
