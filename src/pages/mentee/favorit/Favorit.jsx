import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import MentorCard from "../../../components/common/MentorCard";
import { EmptyState } from "../../../components/common/ActivityUI";
import { useFavorites } from "../../../state/favorites";
import { tutors } from "../../../state/tutors";
import "./Favorit.css";

export default function Favorit({ onTutorProfile, setActive }) {
  const favorites = useFavorites();
  const [query, setQuery] = useState("");
  const saved = tutors.filter((tutor) => favorites.includes(tutor.name));
  const filtered = saved.filter((tutor) => `${tutor.name} ${tutor.subjects}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="favorites-page">
    <header className="favorites-heading"><div><h1>Mentor Favorit</h1><p>Mentor pilihanmu untuk sesi belajar berikutnya.</p></div>
      <span className="favorites-count"><AppIcon name="solar:heart-bold" size={18} />{saved.length} mentor</span>
    </header>
    {saved.length > 0 && <div className="favorites-toolbar">
      <label className="favorites-search"><AppIcon name="fa7-solid:search" size={18} />
        <input type="search" aria-label="Cari mentor favorit" placeholder="Cari nama atau mata pelajaran" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <span>{filtered.length} mentor ditampilkan</span>
    </div>}
    {!saved.length ? <EmptyState title="Belum ada mentor favorit" description="Simpan mentor pilihanmu dengan menekan ikon hati." action="Jelajahi mentor" onAction={() => setActive("Beranda")} />
      : !filtered.length ? <EmptyState title="Mentor tidak ditemukan" description="Coba nama atau mata pelajaran lain." action="Hapus pencarian" onAction={() => setQuery("")} />
        : <div className="favorites-grid">{filtered.map((tutor) => <MentorCard key={tutor.name} tutor={tutor} onProfile={() => onTutorProfile(tutor)} />)}</div>}
  </div>;
}
