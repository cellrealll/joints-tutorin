import profilePicture from "../../assets/alya-profile.avif";
import { useProfile } from "../../state/profile";

export default function UserProfile({ onClick }) {
  const profile = useProfile();
  const fullName = `${profile.firstName} ${profile.lastName}`;
  return (
    <button className="user-chip" onClick={onClick} aria-label={`Buka profil ${fullName}`} title={fullName}>
      <span className="user-avatar">
        <img src={profilePicture} alt="" width="37" height="37" />
      </span>
      <strong>{fullName}</strong>
    </button>
  );
}
