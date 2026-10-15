import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { selectCareer, useRoadmap } from "../../../state/roadmapStore";
import { careerRoadmaps } from "./roadmapData";
import "./CareerFeatures.css";

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
export function CareerPage({ children }) { return <div className="career-feature-page">{children}</div>; }
export function CareerMeter({ value, label }) { return <div className="career-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>; }
