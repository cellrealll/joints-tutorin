import { AccountConnection } from "../../../components/common/BackendStatus";
import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import "./Profil.css";
import profilePicture from "../../../assets/alya-profile.avif";
import { updateProfile, useProfile } from "../../../state/profile";

const fields = [
  { key: "firstName", label: "Nama depan", autoComplete: "given-name" },
  { key: "lastName", label: "Nama belakang", autoComplete: "family-name" },
  { key: "email", label: "Email", type: "email", autoComplete: "email" },
  { key: "phone", label: "Nomor telepon", type: "tel", autoComplete: "tel" },
  { key: "city", label: "Kota", autoComplete: "address-level2" },
  { key: "birthday", label: "Tanggal lahir", type: "date", autoComplete: "bday" },
  { key: "username", label: "Username", autoComplete: "username" },
];

function formatBirthday(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
}

export default function Profil({ setActive }) {
  const profile = useProfile();
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  function saveProfile(event) {
    event.preventDefault();
    const next = Object.fromEntries(fields.map(({ key }) => [key, draft[key].trim()]));
    if (Object.values(next).some((value) => !value)) {
      setMessage("Lengkapi semua data diri terlebih dahulu.");
      return;
    }
    try {
      updateProfile({ ...profile, ...next });
      setEditing(false);
      setMessage("Profil berhasil disimpan.");
    } catch {
      setMessage("Profil belum tersimpan. Coba kembali setelah koneksi tersedia.");
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <h1>Profil Saya</h1>
        <p>Kelola data diri dan peran Anda di Tutor.in.</p>
      </div>
      <section className="profile-summary" aria-label="Ringkasan profil">
        <div className="profile-avatar" aria-hidden="true">
          <img src={profilePicture} alt="" width="90" height="90" />
        </div>
        <div className="profile-identity">
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p>{profile.email}</p>
          <div className="profile-roles" aria-label="Peran akun">
            <span className="profile-role profile-role-mentee">Mentee</span>
            {profile.mentorActive && <span className="profile-role profile-role-mentor">Mentor</span>}
          </div>
        </div>
      </section>
      <AccountConnection />
      <div className="profile-columns">
        <section className="profile-details" aria-labelledby="profile-details-title">
          <form onSubmit={saveProfile}>
            <div className="profile-section-heading">
              <h2 id="profile-details-title">Data diri</h2>
              {!editing && (
                <button className="profile-button" type="button" onClick={() => {
                  setDraft(profile); setMessage(""); setEditing(true);
                }}>
                  <AppIcon name="solar:pen-linear" size={18} />Edit profil
                </button>
              )}
            </div>
            {editing ? (
              <div className="profile-fields">
                {fields.map(({ key, label, type, autoComplete }) => (
                  <div className="profile-field" key={key}>
                    <label htmlFor={`profile-${key}`}>{label}</label>
                    <input id={`profile-${key}`} name={key} type={type || "text"}
                      autoComplete={autoComplete} required maxLength={type === "date" ? undefined : 120}
                      value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
                  </div>
                ))}
              </div>
            ) : (
              <dl className="profile-fields">
                {fields.map(({ key, label }) => (
                  <div className="profile-field" key={key}>
                    <dt>{label}</dt>
                    <dd>{key === "birthday" ? formatBirthday(profile[key]) : profile[key]}</dd>
                  </div>
                ))}
              </dl>
            )}
            {editing && (
              <div className="profile-form-actions">
                <button type="button" className="profile-button profile-button-secondary" onClick={() => {
                  setEditing(false); setMessage("");
                }}>Batal</button>
                <button type="submit" className="profile-button">
                  <AppIcon name="solar:diskette-linear" size={18} />Simpan
                </button>
              </div>
            )}
            <p className="profile-status" role="status">{message}</p>
          </form>
        </section>
        <section className="profile-mentor" aria-labelledby="profile-mentor-title">
          <h2 id="profile-mentor-title">{profile.mentorActive ? "Peran mentor aktif" : "Jadi mentor"}</h2>
          <p>{profile.mentorActive ? "Kelola sesi mengajar, bantu mentee lain, dan dapatkan kredit tambahan." : "Bagikan keahlianmu, bantu mentee lain, dan dapatkan kredit tambahan."}</p>
          <button type="button" className="profile-button" onClick={() => setActive("Jadi mentor")}>
            {profile.mentorActive ? "Dashboard mentor" : "Mulai mengajar"}<AppIcon name={profile.mentorActive ? "solar:transfer-horizontal-linear" : "solar:alt-arrow-right-linear"} size={18} />
          </button>
        </section>
      </div>
    </div>
  );
}
