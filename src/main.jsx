
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { connectBackend, loadCatalogs } from "./state/backend";
import { courseCatalog } from "./state/courseCatalog";
import { tutors } from "./state/tutors";
import { demoIndustryMentors, demoOpportunities } from "./state/careerDemoData";
import { AccountConnection } from "./components/common/BackendStatus";
import "./index.css";

const root = createRoot(document.getElementById("root"));
async function start() {
  root.render(<div className="backend-startup" role="status">Menghubungkan ke Tutor.in…</div>);
  try {
    await connectBackend();
    const catalogs = await loadCatalogs();
    courseCatalog.splice(0, courseCatalog.length, ...catalogs.courses);
    tutors.splice(0, tutors.length, ...catalogs.tutors);
    const mentors = catalogs.mentors.map((mentor) => ({ ...mentor, photo: demoIndustryMentors.find((item) => item.id === mentor.id)?.photo }));
    demoIndustryMentors.splice(0, demoIndustryMentors.length, ...mentors);
    demoOpportunities.splice(0, demoOpportunities.length, ...catalogs.jobs);
    root.render(<React.StrictMode><App /></React.StrictMode>);
  } catch (error) {
    root.render(<div className="backend-startup"><h1>Koneksi belum tersedia</h1><p role="alert">{error.message}</p>
      <button type="button" onClick={start}>Coba lagi</button><AccountConnection /></div>);
  }
}
start();
