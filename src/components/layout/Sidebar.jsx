import { useState } from "react";
import AppIcon from "../common/AppIcon";
import NavbarItem from "./NavbarItem";
import mascot from "../../assets/mascot.png";
import expandedLogo from "../../../images/logos/logo1new.png";
import collapsedLogo from "../../../images/logos/logo2new.png";
import "./Sidebar.css";

const menteeMenu = [
  { label: "Beranda", icon: "fa7-solid:home" },
  { label: "Cari course", icon: "fa7-solid:search" },
  { label: "Courses", icon: "fa7-solid:calendar" },
  { label: "Karier", icon: "career:route", group: true },
  { label: "Riwayat Kredit", icon: "fa7-solid:wallet" },
  { label: "Shop", icon: "bx:store" },
  { label: "Akun", icon: "fa7-solid:user" },
];

const mentorMenu = [
  { label: "Dashboard Mentor", page: "Beranda", icon: "fa7-solid:home" },
  { label: "Sesi Mengajar", page: "Sesi", icon: "fa7-solid:calendar" },
  { label: "Sertifikat Tutor", icon: "solar:medal-ribbon-star-bold" },
  { label: "Riwayat Kredit", icon: "fa7-solid:wallet" },
  { label: "Akun", icon: "fa7-solid:user" },
];

const careerMenu = [
  { label: "Career Roadmap", shortLabel: "Roadmap", icon: "career:route" },
  { label: "Skill Analysis", shortLabel: "Skill Analysis", icon: "career:chart" },
  { label: "Career Portfolio", shortLabel: "Portfolio", icon: "career:folder" },
  { label: "Industry Mentorship", shortLabel: "Mentorship", icon: "career:users" },
  { label: "Career Opportunities", shortLabel: "Opportunities", icon: "career:case" },
];

export default function Sidebar({ active, setActive, isMentor, dashboardMode, onSwitchMode }) {
  const [collapsed, setCollapsed] = useState(() => document.body.classList.contains("sidebar-collapsed"));
  const careerActive = careerMenu.some((page) => page.label === active);
  const [careerMenuChoice, setCareerMenuChoice] = useState({ page: active, open: careerActive });
  if (careerMenuChoice.page !== active) setCareerMenuChoice({ page: active, open: careerActive });
  const careerOpen = careerMenuChoice.page === active ? careerMenuChoice.open : careerActive;
  const targetMode = dashboardMode === "mentor" ? "mentee" : "mentor";
  const roleLabel = isMentor ? `Dashboard ${targetMode}` : "Mulai Mengajar";
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <button
          className="collapse-btn"
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          aria-expanded={!collapsed}
          onClick={() => {
            const next = !collapsed;
            document.body.classList.toggle("sidebar-collapsed", next);
            setCollapsed(next);
          }}
        >
          <AppIcon name={collapsed ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"} size={20} />
        </button>
        <a className="brand brand-logo-link" data-guide-target="brand" href="#" aria-label="Tutor.in — Beranda" onClick={(event) => { event.preventDefault(); setActive("Beranda"); }}>
          <img className="brand-logo-expanded" src={expandedLogo} alt="Tutor.in" />
          <img className="brand-logo-collapsed" src={collapsedLogo} alt="" />
        </a>
      </div>

      <nav className="side-nav">
        {(dashboardMode === "mentor" ? mentorMenu : menteeMenu).map((item) => item.group ? (
          <div className="career-menu" key={item.label}>
            <button type="button" className="nav-item career-menu-trigger" data-guide-target="nav-karier" aria-label="Menu Karier" title="Menu Karier" aria-expanded={careerOpen} aria-controls="career-submenu" onClick={() => setCareerMenuChoice({ page: active, open: !careerOpen })}>
              <AppIcon name={item.icon} size={23} />
              <span>{item.label}</span>
              <AppIcon name="solar:alt-arrow-down-linear" size={16} className="career-menu-chevron" />
            </button>
            {careerOpen && <div className="career-submenu" id="career-submenu">
              {careerMenu.map((page) => <button key={page.label} className={`career-subitem ${active === page.label ? "selected" : ""}`} title={page.label} aria-label={page.label} aria-current={active === page.label ? "page" : undefined} onClick={() => { setCareerMenuChoice({ page: page.label, open: true }); setActive(page.label); }}>
                <AppIcon name={page.icon} size={18} /><span>{page.shortLabel}</span>
              </button>)}
            </div>}
          </div>
        ) : <NavbarItem key={item.label} item={item} active={active} onSelect={setActive} />)}
      </nav>

      <div className="teach-card sidebar-role-area" data-guide-target="role-switch">
        <div className="sidebar-teach-content">
        <div className="mascot-scene"><img className="sidebar-mascot" src={mascot} alt="" width="139" height="116" /></div>

        <h3>{dashboardMode === "mentee" ? "Semangat belajar, kamu pasti bisa!" : "Yuk, bantu yang lain tumbuh!"}</h3>
        <p>{dashboardMode === "mentee" ? "Temukan course yang kamu suka, mulai dari langkah kecil, dan rayakan setiap progresmu." : "Bagikan keahlianmu, dampingi mentee, dan lihat progres mereka berkembang."}</p>
        </div>

        <button className={`mini-cta sidebar-role-switch ${isMentor ? `to-${targetMode}` : ""}`} aria-label={roleLabel} title={roleLabel}
          onClick={() => isMentor ? onSwitchMode(targetMode) : setActive("Jadi mentor")}>
          {isMentor && <AppIcon name="solar:transfer-horizontal-linear" size={19} />}
          <span>{roleLabel}</span>
          {!isMentor && <AppIcon name="solar:alt-arrow-right-linear" size={17} />}
        </button>
      </div>
    </aside>
  );
}
