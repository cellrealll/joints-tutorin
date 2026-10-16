import { useRef, useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { claimMentorMission, useTutorData } from "../../../state/tutorStore";
import { getMentorProgress, mentorLevels } from "../../../state/mentorProgress";
import journeyImage from "../../../assets/mentor-journey.png";
import bannerImage from "../../../assets/mentor-journey-banner.png";
import "../../../components/common/ActivityUI.css";
import "./DashboardMentor.css";

export default function DashboardMentor({ onSessions, onHistory }) {
  const data = useTutorData();
  const { credits, currentIndex, next, missions } = getMentorProgress(data);
  const current = mentorLevels[currentIndex];
  const dialogRef = useRef(null);
  const [detail, setDetail] = useState(null);
  const [feedback, setFeedback] = useState("");
  const openDetail = (value) => { setDetail(value); dialogRef.current.showModal(); };
  const claim = async (mission) => {
    try {
      if (await claimMentorMission(mission.id)) setFeedback(`Hadiah +${mission.reward} kredit berhasil masuk ke saldo!`);
    } catch (error) { setFeedback(error.message || "Hadiah belum dapat diklaim."); }
  };
  const missionRows = () => missions.map((mission) => <div className="mentor-mission" key={mission.id}>
    <span className={`mentor-mission-icon ${mission.color}`}><AppIcon name={mission.icon} size={25} /></span>
    <div className="mentor-mission-copy"><h3>{mission.title}</h3><p>{mission.description}</p></div>
    <div className="mentor-mission-meter"><progress max={mission.target} value={Math.min(mission.value, mission.target)} aria-label={mission.title} /><span>{mission.value}/{mission.target}</span></div>
    <span className="mentor-mission-reward"><AppIcon name="bx:coin-stack" size={25} /><strong>+{mission.reward}<small>kredit</small></strong></span>
    <button className="mentor-claim" disabled={mission.claimed} onClick={() => mission.value >= mission.target ? claim(mission) : openDetail({ mission: mission.id })} aria-label={mission.claimed ? `${mission.title}: hadiah sudah diklaim` : mission.value >= mission.target ? `Klaim hadiah ${mission.title}` : `Detail ${mission.title}`} title={mission.claimed ? "Sudah diklaim" : mission.value >= mission.target ? "Klaim hadiah" : "Detail misi"}>
      <AppIcon name={mission.claimed ? "solar:check-circle-bold" : mission.value >= mission.target ? "solar:gift-bold" : "solar:alt-arrow-right-linear"} size={23} />
    </button>
  </div>);
  const selectedMission = missions.find((mission) => mission.id === detail?.mission);
  const selectedLevel = detail?.level !== undefined ? mentorLevels[detail.level] : null;
  return <div className="mentor-journey">
    <header className="mentor-journey-hero"><img src={bannerImage} alt="" /><div><span className="mentor-journey-eyebrow">DASHBOARD MENTOR</span><h1>Perjalanan Mentor</h1><p>Naik level dengan mengajar, bantu lebih banyak mentee,<br className="mentor-desktop-break" /> dan kumpulkan kredit untuk membuka pencapaian baru!</p></div></header>
    <section className="mentor-credit-overview" data-guide-target="mentor-credit" aria-label="Ringkasan kredit mentor">
      <div><span className="mentor-credit-icon earned"><AppIcon name="fluent:hat-graduation-12-filled" size={25} /></span><div><h2>Total kredit mengajar</h2><strong>{credits} <span>kredit</span></strong><p>Akumulasi hasil mengajar untuk pencapaian level.</p></div></div>
      <div><span className="mentor-credit-icon wallet"><AppIcon name="solar:wallet-bold" size={25} /></span><div><h2>Saldo kredit saat ini</h2><strong>{data.balance} <span>kredit</span></strong><p>Saldo tersedia untuk dipakai belajar sebagai mentee.</p></div><button className="mentor-wallet-history" onClick={onHistory} aria-label="Lihat riwayat kredit" title="Riwayat kredit"><AppIcon name="solar:arrow-right-linear" size={22} /></button></div>
    </section>
    <section className="mentor-level-summary" data-guide-target="mentor-level" aria-label="Progres level mentor">
      <div className="mentor-current-level"><span className="mentor-level-badge"><AppIcon name={current.icon} size={39} /></span><div><span className="mentor-summary-label">LEVEL SAAT INI</span><h2>{current.name}</h2><span className="mentor-level-pill">Level {currentIndex + 1} dari 5</span></div></div>
      <div className="mentor-total-credits"><span className="mentor-summary-label">PROGRES LEVEL</span><strong>{credits} <span>/ {next?.threshold ?? mentorLevels.at(-1).threshold}</span></strong><progress max={next?.threshold ?? credits} value={credits} aria-label="Progres kredit mengajar" /></div>
      <button className="mentor-next-level" onClick={() => openDetail({ level: next ? currentIndex + 1 : currentIndex })}><AppIcon name="solar:cup-star-bold" size={44} /><span>{next ? `${next.threshold - credits} kredit lagi menuju` : "Semua level tercapai!"}<strong>{next?.name ?? current.name}</strong></span><AppIcon name="solar:alt-arrow-right-linear" size={22} /></button>
    </section>
    <section className="mentor-map" aria-label="Peta perjalanan mentor">
      <img src={journeyImage} alt="Lima tempat di sepanjang jalan berkelok pada lembah hijau, dari rumah kecil sampai kastel." />
      <div className="mentor-map-levels">{mentorLevels.map((level, index) => <button key={level.name} className={`mentor-map-stop ${index === currentIndex ? "current" : index < currentIndex ? "complete" : "locked"}`} onClick={() => openDetail({ level: index })} aria-current={index === currentIndex ? "step" : undefined} title={`Lihat level ${index + 1}: ${level.name}`}>
        <div className="mentor-map-label"><span className="mentor-map-icon"><AppIcon name={level.icon} size={22} /></span><div><strong>{index + 1}. {level.name}</strong><span>{level.description}</span></div></div>
        <span className="mentor-map-marker"><AppIcon name={index < currentIndex ? "solar:check-circle-bold" : index === currentIndex ? level.icon : "solar:lock-keyhole-bold"} size={21} /></span>
      </button>)}</div>
    </section>
    <div className="mentor-journey-bottom">
      <section className="mentor-missions"><div className="mentor-section-heading"><AppIcon name="solar:target-bold" size={28} /><div><h2>Misi Minggu Ini</h2><p>Selesaikan misi dan dapatkan kredit tambahan!</p></div><button className="text-link" onClick={() => openDetail({ missions: true })}>Semua misi<AppIcon name="solar:arrow-right-linear" size={18} /></button></div>{missionRows()}</section>
      <section className="mentor-rewards"><div className="mentor-section-heading"><AppIcon name="solar:gift-bold" size={28} /><div><h2>{next ? "Hadiah Level Berikutnya" : "Pencapaian Tertinggi"}</h2><p>{next ? `Capai ${next.name} untuk membuka hadiah.` : "Terima kasih sudah menjadi inspirasi!"}</p></div></div><div className="mentor-reward-content"><span className="mentor-reward-badge"><AppIcon name="solar:shield-star-bold" size={76} /></span><div><h3>{next?.name ?? current.name}</h3><ul>{[`Badge profil ${next?.name ?? current.name}`, "Prioritas rekomendasi ke mentee", "Akses kelas pelatihan eksklusif"].map((item) => <li key={item}><AppIcon name="solar:check-circle-bold" size={17} />{item}</li>)}</ul><button className="text-link" onClick={() => openDetail({ level: next ? currentIndex + 1 : currentIndex })}>Lihat detail hadiah<AppIcon name="solar:arrow-right-linear" size={16} /></button></div></div></section>
    </div>
    <div className="mentor-journey-footer"><button className="activity-outline" onClick={onSessions}><AppIcon name="solar:calendar-linear" size={18} />Jadwal mengajar</button><button className="text-link" onClick={onHistory}>Riwayat kredit<AppIcon name="solar:arrow-right-linear" size={17} /></button></div>
    <p className="activity-feedback" role="status">{feedback}</p>
    <dialog className="activity-dialog mentor-journey-dialog" ref={dialogRef} aria-labelledby="mentor-journey-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="activity-dialog-heading"><h2 id="mentor-journey-dialog-title">{selectedLevel?.name ?? selectedMission?.title ?? "Misi Minggu Ini"}</h2><button aria-label="Tutup" onClick={() => dialogRef.current.close()}><AppIcon name="solar:close-circle-linear" size={25} /></button></div>
      {selectedLevel && <><span className="mentor-dialog-badge"><AppIcon name={selectedLevel.icon} size={46} /></span><p>{selectedLevel.description}</p><p className="activity-muted">{credits >= selectedLevel.threshold ? "Level ini sudah terbuka." : `Butuh ${selectedLevel.threshold - credits} kredit mengajar lagi. Kredit belanja dan hadiah misi tidak dihitung untuk level.`}</p><dl className="activity-pairs"><div><dt>Target kredit mengajar</dt><dd>{selectedLevel.threshold}</dd></div><div><dt>Progres saat ini</dt><dd>{credits} kredit</dd></div></dl><button className="activity-primary" onClick={() => { dialogRef.current.close(); onSessions(); }}>Lihat jadwal mengajar<AppIcon name="solar:arrow-right-linear" size={17} /></button></>}
      {selectedMission && <><p>{selectedMission.description}</p><p className="activity-muted">Progres {selectedMission.value} dari {selectedMission.target}. Hadiah +{selectedMission.reward} kredit. Misi diperbarui setiap Senin.</p><button className="activity-primary" onClick={() => { dialogRef.current.close(); onSessions(); }}>Lihat sesi mengajar</button></>}
      {detail?.missions && <><p className="activity-muted">Periode minggu ini. Setiap hadiah hanya bisa diklaim sekali. Ulasan dihitung setelah diberikan mentee.</p><div className="mentor-dialog-missions">{missionRows()}</div><p className="activity-feedback" role="status">{feedback}</p></>}
    </dialog>
  </div>;
}
