import AppIcon from "../../../components/common/AppIcon";
import { useState } from "react";
import { canJoinSession, isUpcomingSession } from "./sessionUtils";
import { normalizeZoomInvite } from "../../../state/zoomMeeting";
import useSessionClock from "./useSessionClock";
import "./JoinSession.css";

export default function JoinSession({ session, onJoin }) {
  const now = useSessionClock();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const zoomReady = Boolean(normalizeZoomInvite(session.zoomUrl));
  if (session.role !== "mentor" && session.status === "Dikonfirmasi" && isUpcomingSession(session) && (!zoomReady || !session.startedAt)) return <p className="join-session-waiting" role="status">Mentor belum memulai sesi</p>;
  if (!canJoinSession(session, now)) return null;
  return <div className="join-session">
    <button className="primary-button" disabled={busy} onClick={async () => {
      setBusy(true); setMessage("");
      try { await onJoin(session); } catch (error) { setMessage(error.message || "Sesi belum dapat dibuka."); }
      finally { setBusy(false); }
    }}>
      <AppIcon name="solar:videocamera-record-linear" size={18} />{busy ? "Membuka sesi..." : session.role === "mentor" && !zoomReady ? "Siapkan Zoom" : "Mulai sesi"}
    </button>
    {message && <p role="alert">{message}</p>}
  </div>;
}
