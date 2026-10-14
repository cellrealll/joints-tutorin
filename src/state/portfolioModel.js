import { safeURL } from "./careerModel.js";
import { careerSkills } from "./careerSkills.js";

export function eligibleCertificate(course, learning, enrollment = {}, assessments = []) {
  const issued = enrollment.certificate;
  const passed = Array.from({ length: course.sessions.length }, (_, index) => learning.completedSessions.some((session) =>
    session.startStep === index + 1 && assessments.some((result) => result.sessionId === session.id && result.mode === "post" && result.score >= 70))).every(Boolean);
  return learning.completedLessons.length === course.sessions.length && passed && enrollment.projectReview?.status === "approved" &&
    issued?.id && issued?.issuedAt && issued?.issuer === "Tutor.in" ? issued : null;
}
export function portfolioPublicData({ profile, career, state, skills, certificates, learning, teaching, achievements }) {
  const visible = state.portfolio.visibility;
  return {
    introduction: visible.introduction ? { name: `${profile.firstName} ${profile.lastName}`, bio: state.portfolio.bio, interests: state.portfolio.interests, career: career.title } : null,
    skills: visible.skills ? skills.filter((skill) => skill.level > 0).map(({ title, level, source }) => ({ title, level, source })) : [],
    projects: visible.projects ? state.projects.filter((project) => project.visible !== false).map(({ title, description, technologies, image, github, demo, skills: related }) =>
      ({ title, description, technologies, image: /^data:image\/(png|jpeg|webp);base64,/.test(image || "") ? image : "", github: safeURL(github), demo: safeURL(demo), skills: (related || []).map((id) => careerSkills[id]?.title).filter(Boolean) })) : [],
    certificates: visible.certificates ? certificates : [], achievements: visible.certificates ? achievements : [],
    learning: visible.learning ? learning : [], teaching: visible.teaching ? teaching : [],
  };
}
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export function portfolioHTML(data) {
  const intro = data.introduction;
  const cards = data.projects.map((project) => `<article>${project.image ? `<img src="${escape(project.image)}" alt="${escape(project.title)}">` : ""}<h3>${escape(project.title)}</h3><p>${escape(project.description)}</p><p>${escape(project.technologies)}</p><p>${escape((project.skills || []).join(", "))} / project skills are self-reported</p>${[project.github, project.demo].filter(safeURL).map((url) => `<a href="${escape(safeURL(url))}" rel="noopener noreferrer">${escape(url)}</a>`).join(" ")}</article>`).join("");
  const section = (title, values) => values.length ? `<section><h2>${title}</h2>${values.map((value) => `<p>${escape(value)}</p>`).join("")}</section>` : "";
  return `<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(intro?.name || "Learning Portfolio")} | Tutor.in</title><style>body{font-family:system-ui,sans-serif;color:#16205e;background:#f6f9ff;margin:0;padding:24px}main{max-width:900px;margin:auto}header,section{background:white;border:1px solid #ddd;border-radius:20px;padding:24px;margin:20px 0}header{background:#e0f7ed}h1,h2{color:#6741ce}p{line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}article{border:1px solid #ddd;border-radius:12px;padding:18px;margin:14px 0}img{max-width:100%;max-height:300px}a{display:inline-block;overflow-wrap:anywhere;margin-right:12px;color:#6741ce}</style></head><body><main><header><small>TUTOR.IN / CAREER PORTFOLIO</small><h1>${escape(intro?.name || "Learning Portfolio")}</h1>${intro ? `<h2>${escape(intro.career)}</h2><p>${escape(intro.bio)}</p><p>${escape(intro.interests)}</p>` : ""}</header>${section("Skills", data.skills.map((skill) => `${skill.title} / ${["", "Beginner", "Intermediate", "Advanced"][skill.level]} / ${skill.source}`))}${cards ? `<section><h2>Projects</h2>${cards}</section>` : ""}${section("Learning records", data.certificates.map((record) => `${record.title} / ${record.id} / ${record.issuedAt}`))}${section("Achievements", data.achievements)}${section("Learning experience", data.learning)}${section("Peer teaching", data.teaching)}<footer>Learning portfolio shared by its owner. Skills are not independently verified. Exported snapshots do not update automatically.</footer></main></body></html>`;
}
