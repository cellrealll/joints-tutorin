import { useState } from "react";
import { useCareerState, restoreCareerState } from "../../../state/careerStore";
import { useRoadmap, selectCareer } from "../../../state/roadmapStore";
import { careerAccountAvailable, saveCareerToAccount, loadCareerFromAccount } from "../../../state/careerApi";

export default function CareerAccountSync({ onLoaded }) {
  const state = useCareerState();
  const { target } = useRoadmap();
  const [busy, setBusy] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [message, setMessage] = useState("");
  if (!careerAccountAvailable()) return null;
  async function sync(load) {
    setBusy(true); setMessage("");
    try {
      if (load) {
        const saved = await loadCareerFromAccount();
        if (!saved?.state) throw new Error("Belum ada career profile pada akun ini.");
        restoreCareerState(saved.state); selectCareer(saved.target); onLoaded?.(saved.state.portfolio);
      } else await saveCareerToAccount(state, target);
      setMessage(load ? "Career profile akun dimuat." : "Career profile disimpan ke akun.");
      setConfirmLoad(false);
    } catch (error) { setMessage(error.message || "Sinkronisasi gagal. Data browser tetap tersedia."); }
    finally { setBusy(false); }
  }
  return <section className="activity-panel"><h2>Simpan ke akun Tutor.in</h2><p className="career-explainer">Simpan assessment, portfolio, proyek, dan peluang tersimpan ke akun Tutor.in yang terhubung. Data belajar dan wallet tetap mengikuti sumber aslinya.</p><div className="career-actions"><button className="activity-primary" disabled={busy} onClick={() => sync(false)}>{busy ? "Memproses..." : "Simpan ke akun"}</button><button className="activity-outline" disabled={busy} onClick={() => setConfirmLoad(true)}>Muat dari akun</button></div>{confirmLoad && <div className="career-demo-note">Memuat data akun akan mengganti career profile lokal.<button className="activity-primary" disabled={busy} onClick={() => sync(true)}>Ya, muat</button><button className="text-link" disabled={busy} onClick={() => setConfirmLoad(false)}>Batal</button></div>}<p className="activity-feedback" role="status">{message}</p></section>;
}
