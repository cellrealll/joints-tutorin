import { useEffect, useRef, useState } from "react";
import AppIcon from "../../components/common/AppIcon";
import room from "../../assets/landing-study-room.png";
import campus from "../../assets/landing-campus.png";
import welcomeMascot from "../../assets/mascot-welcome.png";
import readingMascot from "../../assets/mascot-reading.png";
import expandedLogo from "../../../images/logos/logo1new.png";
import "./LandingPage.css";

const features = [
  { icon: "solar:users-group-rounded-bold", text: "Belajar dari sesama", color: "green" },
  { icon: "solar:calendar-bold", text: "Jadwal fleksibel", color: "purple" },
  { icon: "solar:chart-square-bold", text: "Lihat progres nyata", color: "yellow" },
];

export default function LandingPage({ onChooseRole, onStart }) {
  const [choosingRole, setChoosingRole] = useState(() => window.location.hash === "#pilih-peran");
  const roleHeading = useRef(null);
  useEffect(() => {
    const onHashChange = () => setChoosingRole(window.location.hash === "#pilih-peran");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (choosingRole) roleHeading.current?.focus({ preventScroll: true });
  }, [choosingRole]);
  return <main className="landing-page">
    {!choosingRole ? <section className="landing-welcome" id="mulai" aria-labelledby="landing-title">
      <img className="landing-background" src={room} alt="" fetchPriority="high" />
      <a className="landing-brand" href="#mulai" aria-label="Tutor.in beranda"><h1 id="landing-title"><img src={expandedLogo} alt="Tutor.in" /></h1></a>
      <div className="landing-intro">
        <p className="landing-eyebrow">Siap belajar dengan cara paling fun?</p>
        <h2>Swap knowledge,<br /><span>Grow</span> together.</h2>
        <p className="landing-description">Tutor.in membantu kamu belajar bareng mentor pilihan dengan suasana yang nyaman, jadwal fleksibel, dan progres yang terasa nyata.</p>
        <button className="landing-start" onClick={onStart}>Mulai masuk Tutor.in<AppIcon name="solar:arrow-right-linear" size={25} /></button>
        <ul className="landing-features">{features.map((feature) => <li key={feature.text}><span className={`landing-feature-icon ${feature.color}`}><AppIcon name={feature.icon} size={27} /></span><span>{feature.text}</span></li>)}</ul>
      </div>
      <img className="landing-welcome-mascot" src={welcomeMascot} alt="Maskot Tutor.in membawa buku dan menyapa." width="550" height="550" />
    </section> : <section className="landing-roles" aria-labelledby="landing-role-heading">
      <img className="landing-background" src={campus} alt="" loading="lazy" />
      <div className="landing-role-heading"><p className="landing-role-eyebrow">SATU AKUN, DUA PERJALANAN</p><h2 ref={roleHeading} tabIndex={-1} id="landing-role-heading">How would you like<br /><span>to start?</span></h2><p>Pilih peranmu. Kamu selalu bisa berganti nanti!</p></div>
      <div className="landing-role-options">
        <button className="landing-role-option teach" onClick={() => onChooseRole("mentor")} aria-label="Mengajar sebagai mentor">
          <span className="landing-role-icon"><AppIcon name="fluent:hat-graduation-12-filled" size={65} /></span><span className="landing-role-prefix">Aku ingin</span><strong>Mengajar</strong><span className="landing-role-description">Bagikan keahlian, bantu sesama,<br />dan kumpulkan kredit.</span><span className="landing-role-arrow"><AppIcon name="solar:arrow-right-linear" size={33} /></span><span className="landing-role-caption">Mulai sebagai mentor</span>
        </button>
        <button className="landing-role-option learn" onClick={() => onChooseRole("mentee")} aria-label="Belajar sebagai mentee">
          <span className="landing-role-icon"><AppIcon name="fluent:book-open-24-filled" size={65} /></span><span className="landing-role-prefix">Aku ingin</span><strong>Belajar</strong><span className="landing-role-description">Temukan mentor, pelajari hal baru,<br />dan gunakan kreditmu.</span><span className="landing-role-arrow"><AppIcon name="solar:arrow-right-linear" size={33} /></span><span className="landing-role-caption">Mulai sebagai mentee</span>
        </button>
      </div>
      <img className="landing-reading-mascot" src={readingMascot} alt="Maskot Tutor.in sedang membaca buku." width="360" height="360" loading="lazy" />
      <a className="landing-back" href="#mulai"><AppIcon name="solar:arrow-left-linear" size={16} />Kembali</a>
    </section>}
  </main>;
}
