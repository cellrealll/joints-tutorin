import AppIcon from "../../../components/common/AppIcon";
import { canJoinSession } from "./sessionUtils";
import { normalizeZoomInvite } from "../../../state/zoomMeeting";
import useSessionClock from "./useSessionClock";
import "./JoinSession.css";

export default function JoinSession({ session, onJoin }) {
  const now = useSessionClock();
  if (!canJoinSession(session, now)) return null;
  const zoomReady = Boolean(normalizeZoomInvite(session.zoomUrl));
  if (session.role !== "mentor" && !zoomReady) return <p className="join-session-waiting">Menunggu link Zoom dari mentor</p>;
  return <div className="join-session">
    <button className="primary-button" onClick={() => onJoin(session)}>
      <AppIcon name="solar:videocamera-record-linear" size={18} />{session.role === "mentor" ? zoomReady ? "Mulai sesi" : "Siapkan Zoom" : "Masuk sesi"}
    </button>
  </div>;
}
