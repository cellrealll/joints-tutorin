import { useState } from "react";
import AppIcon from "./AppIcon";
import TutorPortrait from "./TutorPortrait";
import { toggleFavorite, useFavorites } from "../../state/favorites";
import "./MentorCard.css";

export default function MentorCard({ tutor, onProfile }) {
  const favorites = useFavorites();
  const [error, setError] = useState("");
  const favorite = favorites.includes(tutor.name);
  const label = `${favorite ? "Hapus dari" : "Tambahkan ke"} favorit: ${tutor.name}`;
  function toggle() {
    try { toggleFavorite(tutor.name); setError(""); }
    catch { setError("Favorit belum tersimpan. Periksa izin penyimpanan browser."); }
  }
  return <article className="tutor-card mentor-list-card">
    <button className="mentor-card-heart" aria-label={label} title={label} aria-pressed={favorite} onClick={toggle}>
      <AppIcon name={favorite ? "solar:heart-bold" : "solar:heart-linear"} size={23} />
    </button>
    <div className="tutor-avatar"><TutorPortrait name={tutor.name} /></div>
    <h3>{tutor.name}</h3>
    <p className="tutor-subjects">{tutor.subjects}</p>
    <div className="rating-line">
      <AppIcon name="solar:star-bold" size={17} className="rating-star" />
      <strong>{tutor.rating}</strong><span>({tutor.reviews})</span>
      <span className={`tutor-badge ${tutor.roleClass}`}>{tutor.role}</span>
    </div>
    <div className="credit-line"><AppIcon name="bx:coin-stack" size={15} /><span>{tutor.credits} kredit / sesi</span></div>
    <button className="outline-button profile-button" onClick={onProfile}>Lihat Profil<AppIcon name="solar:alt-arrow-right-linear" size={19} /></button>
    {error && <p className="mentor-card-error" role="alert">{error}</p>}
  </article>;
}
