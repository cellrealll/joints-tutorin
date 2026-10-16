import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AppIcon from "../common/AppIcon";
import titoCheer from "../../assets/mascot.png";
import titoWelcome from "../../assets/mascot-welcome.png";
import titoReading from "../../assets/mascot-reading.png";
import "./TitoGuide.css";

const guideSteps = {
  mentee: [
    { title: "Halo, aku Tito!", text: "Selamat datang di Tutor.in! Di sini kamu bisa belajar dari sesama mahasiswa, mengembangkan skill, dan menyiapkan kariermu.", image: titoWelcome, page: "Beranda", target: "brand" },
    { title: "Temukan course yang pas", text: "Cari course dan mentor sesuai skill yang ingin kamu pelajari. Kamu bisa mulai dari rekomendasi yang paling cocok.", image: titoReading, page: "Cari course", target: "nav-cari-course" },
    { title: "Pantau sesi belajarmu", text: "Di Courses ada jadwal, detail booking, dan tombol Masuk sesi yang aktif mulai 10 menit sebelum sesi setelah mentor membagikan link Zoom.", image: titoReading, page: "Courses", target: "nav-courses" },
    { title: "Rancang langkah kariermu", text: "Buka menu Karier untuk Roadmap, Skill Analysis, Portfolio, Mentorship, dan peluang magang.", image: titoCheer, page: "Career Roadmap", target: "nav-karier" },
    { title: "Kenali kreditmu", text: "Saldo kredit dan semua transaksi belajarmu ada di sini. Kamu juga bisa memperoleh kredit dengan mengajar sebagai mentor.", image: titoWelcome, page: "Riwayat Kredit", target: "credit-balance" },
  ],
  mentor: [
    { title: "Halo, aku Tito!", text: "Selamat datang di Tutor.in! Sebagai mentor, kamu bisa berbagi ilmu, mendampingi mentee, dan mengumpulkan kredit dari sesi mengajar.", image: titoWelcome, page: "Beranda", target: "brand" },
    { title: "Lihat perkembanganmu", text: "Dashboard Mentor memperlihatkan level, progres mengajar, dan misi yang bisa kamu selesaikan.", image: titoCheer, page: "Beranda", target: "mentor-level" },
    { title: "Atur sesi mengajar", text: "Di Sesi Mengajar kamu bisa melihat jadwal, memulai Zoom dari detail sesi, dan membagikan link agar mentee bisa bergabung.", image: titoReading, page: "Sesi", target: "nav-sesi" },
    { title: "Pantau hasil mengajar", text: "Riwayat Kredit mencatat kredit yang masuk dan saldo yang bisa kamu gunakan saat belajar.", image: titoCheer, page: "Riwayat Kredit", target: "credit-balance" },
    { title: "Bisa kembali belajar", text: "Satu akun punya dua peran. Gunakan tombol Dashboard mentee untuk kembali belajar kapan saja.", image: titoWelcome, page: "Beranda", target: "role-switch" },
  ],
};

function guideKey(profile, role) {
  return `tutorin-tito-guide-v2:${(profile.email || profile.username || "local-user").trim().toLowerCase()}:${role}`;
}

export default function TitoGuide({ profile, role, onNavigate }) {
  const storageKey = guideKey(profile, role);
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(storageKey) !== "done"; }
    catch { return true; }
  });
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);
  const guideRef = useRef(null);
  const nextRef = useRef(null);
  const steps = guideSteps[role] || guideSteps.mentee;
  const current = steps[step];

  useEffect(() => {
    if (!open) return undefined;
    const shell = guideRef.current?.closest(".app-shell");
    const locked = [shell?.querySelector(".sidebar"), shell?.querySelector(".main-area")].filter(Boolean);
    const previous = locked.map((element) => element.inert);
    locked.forEach((element) => { element.inert = true; });
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nextRef.current?.focus();
    return () => {
      locked.forEach((element, index) => { element.inert = previous[index]; });
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    let frame;
    const measure = () => {
      const target = document.querySelector(`[data-guide-target="${current.target}"]`);
      if (!target || !target.getClientRects().length) { setSpotlight(null); return; }
      let rect = target.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        target.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
        rect = target.getBoundingClientRect();
      }
      const padding = 7;
      setSpotlight({ top: Math.max(4, rect.top - padding), left: Math.max(4, rect.left - padding), width: Math.min(window.innerWidth - 8, rect.width + padding * 2), height: rect.height + padding * 2 });
    };
    frame = requestAnimationFrame(measure);
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [current, open]);

  function goTo(index) {
    setStep(index);
    onNavigate(steps[index].page);
    nextRef.current?.focus();
  }

  function finish() {
    try { localStorage.setItem(storageKey, "done"); } catch { /* Dismiss for this visit. */ }
    setOpen(false);
  }

  if (!open) return null;

  return <>
    <div className="tito-lock" aria-hidden="true" />
    {spotlight && <div className="tito-spotlight" style={spotlight} aria-hidden="true" />}
    {!spotlight && <div className="tito-shade" aria-hidden="true" />}
    <aside className="tito-guide" ref={guideRef} role="dialog" aria-modal="true" aria-label="Panduan Tito">
      <div className="tito-guide-top"><span className="tito-guide-name"><AppIcon name="solar:stars-bold" size={17} />TITO MEMANDU</span><button type="button" onClick={finish} aria-label="Lewati panduan Tito">Lewati</button></div>
      <div className="tito-guide-body" aria-live="polite"><div><span className="tito-guide-count">Langkah {step + 1} dari {steps.length}</span><h2>{current.title}</h2><p>{current.text}</p></div><img className="tito-guide-mascot" src={current.image} alt="Tito, maskot Tutor.in" /></div>
      <div className="tito-guide-progress" aria-label={`Langkah ${step + 1} dari ${steps.length}`}>{steps.map((item, index) => <span key={item.title} className={index <= step ? "done" : ""} />)}</div>
      <div className="tito-guide-actions"><button type="button" className="tito-secondary" disabled={step === 0} onClick={() => goTo(step - 1)}>Kembali</button><button type="button" className="tito-primary" ref={nextRef} onClick={() => step === steps.length - 1 ? finish() : goTo(step + 1)}>{step === steps.length - 1 ? "Selesai" : "Lanjut"}<AppIcon name="solar:arrow-right-linear" size={17} /></button></div>
    </aside>
  </>;
}
