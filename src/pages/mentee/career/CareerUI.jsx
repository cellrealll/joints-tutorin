import { useEffect, useRef, useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { selectCareer, useRoadmap } from "../../../state/roadmapStore";
import { careerRoadmaps } from "./roadmapData";
import "./CareerFeatures.css";

const pages = [
  ["Career Roadmap", "Roadmap", "career:route"], ["Skill Analysis", "Skill Analysis", "career:chart"],
  ["Career Portfolio", "Portfolio", "career:folder"], ["Industry Mentorship", "Mentorship", "career:users"],
  ["Career Opportunities", "Opportunities", "career:case"],
];
export function CareerNav({ active, setActive }) {
  const navRef = useRef(null);
  useEffect(() => {
    const nav = navRef.current;
    const button = nav?.querySelector('[aria-current="page"]');
    if (!button) return;
    const align = () => {
      if (nav.scrollWidth <= nav.clientWidth) return;
      const container = nav.getBoundingClientRect();
      const selected = button.getBoundingClientRect();
      nav.scrollLeft += selected.left - container.left - (nav.clientWidth - selected.width) / 2;
    };
    const frame = requestAnimationFrame(align);
    const observer = new ResizeObserver(align);
    observer.observe(nav); observer.observe(button);
    window.addEventListener("resize", align);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", align); };
  }, [active]);
  return <nav ref={navRef} className="career-nav" aria-label="Career development">{pages.map(([page, label, icon]) => <button key={page} aria-current={active === page ? "page" : undefined} onClick={() => setActive(page)}><AppIcon name={icon} size={18} />{label}</button>)}</nav>;
}
export function CareerTarget() {
  const { target } = useRoadmap();
  const [error, setError] = useState("");
  return <div className="career-target"><label htmlFor="shared-career-target">Target karier<select id="shared-career-target" value={target} onChange={(event) => {
    try { selectCareer(event.target.value); setError(""); } catch { setError("Pilihan belum tersimpan. Coba kembali."); }
  }}>{careerRoadmaps.map((career) => <option key={career.id} value={career.id}>{career.title}</option>)}</select></label><p role="status">{error}</p></div>;
}
export function CareerHero({ title, text, icon, children, tone = "blue" }) {
  return <section className={`career-feature-hero ${tone}`}><div><span>LEARN. GROW. GO FURTHER.</span><h1>{title}</h1><p>{text}</p>{children}</div><span className="career-hero-icon" aria-hidden="true"><AppIcon name={icon} size={80} /></span></section>;
}
export function CareerPage({ active, setActive, children }) { return <div className="career-feature-page"><CareerNav active={active} setActive={setActive} />{children}</div>; }
export function CareerMeter({ value, label }) { return <div className="career-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>; }
