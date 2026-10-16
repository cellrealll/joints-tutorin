import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { formatDate, useTutorData } from "../../../state/tutorStore";
import { useProfile } from "../../../state/profile";
import { formatTeachingTime, mentorCertificates } from "../../../state/mentorCertificates";
import londonArtwork from "../../../../images/certificate/0b7732ec-b0f2-4518-940b-f7b96aa8bff4.png";
import japanArtwork from "../../../../images/certificate/99da7d33-1698-4150-89c3-fd417fe7e0f8.png";
import parisArtwork from "../../../../images/certificate/1c3ea4da-50ad-4009-b485-5eb153710917.png";
import tutorinLogo from "../../../../images/logos/logo1new.png";
import "./MentorCertificates.css";

const artworks = [londonArtwork, japanArtwork, parisArtwork];
function artworkFor(subject, index) {
  if (/java/i.test(subject)) return londonArtwork;
  if (/react/i.test(subject)) return japanArtwork;
  if (/python/i.test(subject)) return parisArtwork;
  return artworks[index % artworks.length];
}

export default function MentorCertificates({ onSessions }) {
  const { sessions } = useTutorData();
  const profile = useProfile();
  const certificates = mentorCertificates(sessions);
  const [selectedId, setSelectedId] = useState(null);
  const selected = certificates.find((certificate) => certificate.id === selectedId);
  const selectedArtwork = selected && artworkFor(selected.subject, certificates.indexOf(selected));
  const mentorName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username || "Mentor Tutor.in";

  return <div className="mentor-certificates">
    {selected ? <>
      <div className="mentor-certificate-detail-nav">
        <button type="button" onClick={() => setSelectedId(null)}><AppIcon name="solar:alt-arrow-left-linear" size={19} /> Semua sertifikat</button>
        <button type="button" onClick={() => window.print()}><AppIcon name="solar:printer-linear" size={19} /> Cetak / simpan PDF</button>
      </div>
      <article className="mentor-certificate-document" aria-label={`Sertifikat mengajar ${selected.subject}`}>
        <div className="mentor-certificate-document-art"><img src={selectedArtwork} alt="" /><div className="mentor-certificate-art-message"><span>LEARN · TEACH · GROW</span><strong>Belajar bersama,<br />tumbuh bersama.</strong><small>Terima kasih telah berbagi ilmu di Tutor.in.</small></div></div>
        <div className="mentor-certificate-document-body">
          <div className="mentor-certificate-letterhead"><img src={tutorinLogo} alt="Tutor.in" /><span>Nomor sertifikat<br /><strong>{selected.id}</strong></span></div>
          <div className="mentor-certificate-seal" aria-hidden="true">✦</div>
          <p className="mentor-certificate-eyebrow">TUTOR.IN · KONTRIBUSI MENGAJAR</p>
          <h1>Sertifikat Apresiasi</h1>
          <p className="mentor-certificate-awarded">Dengan bangga diberikan kepada</p>
          <h2>{mentorName}</h2>
          <p className="mentor-certificate-description">Atas dedikasi berbagi pengetahuan dan mendampingi sesama pelajar sebagai mentor Tutor.in dalam bidang</p>
          <h3>{selected.subject}</h3>
          <p className="mentor-certificate-contribution">Kontribusi ini tercatat melalui {selected.sessions} sesi mengajar yang selesai, dengan total {formatTeachingTime(selected.minutes)} pendampingan belajar.</p>
          <div className="mentor-certificate-document-stats"><span><strong>{selected.sessions}</strong><small>Sesi mengajar selesai</small></span><span><strong>{formatTeachingTime(selected.minutes)}</strong><small>Total waktu mengajar</small></span></div>
          <div className="mentor-certificate-document-footer"><span><small>Tanggal penerbitan</small><strong>{formatDate(selected.issuedAt)}</strong></span><span><small>Diterbitkan oleh</small><strong>Tutor.in</strong></span></div>
        </div>
      </article>
      <section className="mentor-certificate-evidence">
        <div><h2>Dasar penerbitan</h2><p>Ringkasan ini dihitung dari sesi mengajar yang berstatus selesai di akunmu.</p></div>
        <ul>{selected.evidence.map((session) => <li key={session.id}><AppIcon name="solar:check-circle-bold" size={20} /><span><strong>{formatDate(session.date)}</strong><small>{session.learner ? `Bersama ${session.learner} · ` : ""}{formatTeachingTime(Number(session.duration) || 0)}</small></span></li>)}</ul>
        <p className="mentor-certificate-note">ID mengacu pada catatan di akun Tutor.in. Verifikasi publik dan QR belum tersedia.</p>
      </section>
    </> : <>
      <header className="mentor-certificates-heading">
        <div><span className="mentor-certificate-eyebrow">PORTOFOLIO MENGAJAR</span><h1>Tiket Sertifikat Tutor</h1><p>Setiap topik yang sudah kamu ajarkan memiliki tiketnya sendiri. Pilih tiket untuk melihat detail sertifikat dan riwayat sesinya.</p></div>
        <div className="mentor-certificates-count"><span><AppIcon name="solar:medal-ribbon-star-bold" size={27} />{certificates.length}</span><strong>Sertifikat aktif</strong><small>Dari sesi mengajar selesai</small></div>
      </header>
      {certificates.length ? <div className="mentor-ticket-list">{certificates.map((certificate, index) => <button type="button" className="mentor-ticket" key={certificate.id} onClick={() => { setSelectedId(certificate.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Lihat sertifikat ${certificate.subject}`}>
        <span className={`mentor-ticket-art mentor-ticket-art-${index % 3}`}><img src={artworkFor(certificate.subject, index)} alt="" /><span className="mentor-ticket-art-label">Tutor.in <AppIcon name="solar:stars-bold" size={18} /></span></span>
        <span className="mentor-ticket-content"><span className="mentor-ticket-topline">SERTIFIKAT MENGAJAR <span>{String(index + 1).padStart(2, "0")}</span></span><strong className="mentor-ticket-title">{certificate.subject}<br />Tutor</strong><span className="mentor-ticket-metrics"><span><AppIcon name="solar:clock-circle-bold" size={26} /><span><strong>{formatTeachingTime(certificate.minutes)}</strong><small>waktu mengajar</small></span></span><span><AppIcon name="solar:check-circle-bold" size={26} /><span><strong>{certificate.sessions} sesi</strong><small>telah selesai</small></span></span></span><span className="mentor-ticket-bottom"><code>{certificate.id}</code><span>Lihat detail <AppIcon name="solar:arrow-right-linear" size={17} /></span></span></span>
      </button>)}</div> : <div className="mentor-certificates-empty"><AppIcon name="solar:medal-ribbon-star-linear" size={48} /><h2>Belum ada sertifikat mengajar</h2><p>Sertifikat untuk suatu topik akan muncul setelah sesi mengajarmu selesai.</p><button type="button" onClick={onSessions}>Lihat sesi mengajar <AppIcon name="solar:arrow-right-linear" size={18} /></button></div>}
    </>}
  </div>;
}
