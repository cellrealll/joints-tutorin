import { useState } from "react";
import AppIcon from "../common/AppIcon";
import NavbarItem from "./NavbarItem";
import mascot from "../../assets/mascot.png";

const menu = [
  { label: "Beranda", icon: "fa7-solid:home" },
  { label: "Cari course", icon: "fa7-solid:search" },
  { label: "Courses", icon: "fa7-solid:calendar" },
  { label: "Riwayat Kredit", icon: "fa7-solid:wallet" },
  { label: "Shop", icon: "bx:store" },
  { label: "Akun", icon: "fa7-solid:user" },
];

export default function Sidebar({ active, setActive, isMentor, dashboardMode, onSwitchMode }) {
  const [collapsed, setCollapsed] = useState(() => document.body.classList.contains("sidebar-collapsed"));
  const targetMode = dashboardMode === "mentor" ? "mentee" : "mentor";
  const roleLabel = isMentor ? `Dashboard ${targetMode}` : "Mulai Mengajar";
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-avatar">
          <AppIcon name="fa7-solid:user" size={27} />
        </div>

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
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActive("Beranda"); }}>
          Tutor<span>.in</span>
        </a>
      </div>

      <nav className="side-nav">
        {menu.filter((item) => dashboardMode !== "mentor" || !["Cari course", "Shop"].includes(item.label)).map((item) => (
          <NavbarItem
            key={item.label}
            item={item}
            active={active}
            onSelect={setActive}
          />
        ))}
      </nav>

      <div className="teach-card sidebar-role-area">
        <div className="sidebar-teach-content">
        <div className="mascot-scene"><img className="sidebar-mascot" src={mascot} alt="" width="139" height="116" /></div>

        <h3>Bersama, kita saling tumbuh!</h3>
        <p>Ajarkan apa yang kamu kuasai, pelajari apa yang kamu butuhkan.</p>
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
