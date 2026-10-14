function object(value) { return value && typeof value === "object" && !Array.isArray(value); }
function validateCareerData(body) {
  if (!object(body) || body.version !== 1 || !object(body.state) || !object(body.state.skillAttempts) ||
    !Array.isArray(body.state.projects) || body.state.projects.length > 50 || !Array.isArray(body.state.savedJobs) || body.state.savedJobs.length > 200 ||
    !object(body.state.portfolio) || !object(body.state.portfolio.visibility)) return null;
  if (!["frontend", "design", "backend", "data", "mobile"].includes(body.target)) return null;
  const { portfolio, projects, skillAttempts, savedJobs } = body.state;
  if (typeof portfolio.bio !== "string" || portfolio.bio.length > 1200 || typeof portfolio.interests !== "string" || portfolio.interests.length > 250) return null;
  const visibilityKeys = ["introduction", "skills", "projects", "certificates", "learning", "teaching"];
  if (!visibilityKeys.every((key) => typeof portfolio.visibility[key] === "boolean") || !savedJobs.every((id) => typeof id === "string" && id.length < 100)) return null;
  if (!projects.every((project) => object(project) && typeof project.id === "string" && typeof project.title === "string" && project.title.length <= 120 &&
    typeof project.description === "string" && project.description.length <= 2000 && typeof project.technologies === "string" && project.technologies.length <= 250 &&
    typeof project.visible === "boolean" && Array.isArray(project.skills) && project.skills.every((id) => typeof id === "string" && id.length <= 100) &&
    [project.github, project.demo].every((value) => typeof value === "string" && (value === "" || /^https?:\/\//i.test(value))) &&
    typeof project.image === "string" && project.image.length <= 1500000 && (project.image === "" || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(project.image)))) return null;
  if (Object.keys(skillAttempts).length > 100 || !Object.entries(skillAttempts).every(([id, attempt]) => id.length <= 100 && object(attempt) && attempt.version === 1 &&
    typeof attempt.submittedAt === "string" && Number.isFinite(Date.parse(attempt.submittedAt)) && object(attempt.answers) &&
    Object.keys(attempt.answers).length === 3 && [0, 1, 2].every((index) => Number.isInteger(attempt.answers[index]) && attempt.answers[index] >= 0 && attempt.answers[index] <= 2))) return null;
  return { version: 1, target: body.target, state: { skillAttempts, projects, savedJobs, portfolio: { bio: portfolio.bio, interests: portfolio.interests,
    visibility: Object.fromEntries(visibilityKeys.map((key) => [key, portfolio.visibility[key]])) } } };
}
module.exports = { validateCareerData };
