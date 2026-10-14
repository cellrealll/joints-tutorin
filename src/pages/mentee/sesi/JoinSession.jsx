import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { canJoinSession } from "./sessionUtils";
import useSessionClock from "./useSessionClock";
import "./JoinSession.css";

export default function JoinSession({ session }) {
  const now = useSessionClock();
  const [clicked, setClicked] = useState(false);
  if (!canJoinSession(session, now)) return null;
  return <div className="join-session">
    <button className="primary-button" onClick={() => setClicked(true)}>
      <AppIcon name="solar:videocamera-record-linear" size={18} />Join Session
    </button>
    {clicked && <p role="status">Integrasi Zoom belum tersedia. Tautan sesi akan tersedia di sini.</p>}
  </div>;
}
