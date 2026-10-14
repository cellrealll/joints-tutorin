import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { careerSkills } from "../src/state/careerSkills.js";
import { courseCatalog } from "../src/state/courseCatalog.js";
import { assessedLevel, buildSkillProfile, hasMastery, recommendedCourseStart, matchOpportunity, safeURL } from "../src/state/careerModel.js";
import { courseLearningProgress, roadmapProgress } from "../src/state/learningProgress.js";
import { careerFor } from "../src/pages/mentee/career/roadmapData.js";
import { demoIndustryMentors, industrySlots, demoOpportunities } from "../src/state/careerDemoData.js";
import { prepareIndustryBooking, cancelIndustryBooking } from "../src/state/industryBooking.js";
import { eligibleCertificate, portfolioPublicData, portfolioHTML } from "../src/state/portfolioModel.js";

const require = createRequire(import.meta.url);
const { validateCareerData } = require("../backend/src/validation/career.js");
const attempt = (id, wrong = []) => ({ version: 1, submittedAt: "2026-10-14T00:00:00Z", answers: Object.fromEntries(careerSkills[id].questions.map((question, index) => [index, wrong.includes(index) ? (question.correct + 1) % 3 : question.correct])) });
const profileFor = (ids = [], enrollments = {}, legacy = []) => buildSkillProfile(Object.fromEntries(ids.map((id) => [id, attempt(id)])), courseCatalog, [], enrollments, legacy);

test("competency assessments grade individual answers and ignore incomplete or wrong-version attempts", () => {
  assert.equal(assessedLevel("html", attempt("html")), 3);
  assert.equal(assessedLevel("html", attempt("html", [0])), 2);
  assert.equal(assessedLevel("html", attempt("html", [0, 1])), 1);
  assert.equal(assessedLevel("html", { ...attempt("html"), version: 2 }), 0);
  assert.equal(assessedLevel("html", { ...attempt("html"), answers: { 0: 1 } }), 0);
});
test("legacy programming results only demonstrate logic, not unrelated competencies", () => {
  const profile = profileFor([], {}, [{ bank: "programming", logicLevel: 3, score: 100 }]);
  assert.equal(profile.logic.assessed, 3);
  for (const id of ["html", "css", "javascript", "react"]) assert.equal(profile[id].assessed, 0);
});
test("lesson skipping requires advanced competency and all prerequisite mastery", () => {
  const cssOnly = profileFor(["css"]);
  assert.equal(hasMastery("css", cssOnly), false);
  assert.equal(recommendedCourseStart("frontend-course", cssOnly), 1);
  const basics = profileFor(["html", "css"]);
  assert.equal(recommendedCourseStart("frontend-course", basics), 3);
  const withoutLogic = profileFor(["html", "css", "javascript"]);
  assert.equal(recommendedCourseStart("frontend-course", withoutLogic), 3);
  const complete = profileFor(["html", "css", "logic", "javascript", "react", "api", "testing"]);
  assert.equal(recommendedCourseStart("frontend-course", complete), 8);
  assert.equal(recommendedCourseStart("frontend-course", profileFor([], { "frontend-course": { completedLessons: [0, 1, 2] } })), 1);
});
test("mastered foundational milestones update roadmap without fabricating course completion", () => {
  const profile = profileFor(["html", "css"]);
  const mastered = Object.keys(profile).filter((id) => hasMastery(id, profile));
  const progress = roadmapProgress(careerFor("frontend"), courseCatalog, [], {}, [], mastered);
  assert.equal(progress.completed, 2);
  assert.equal(progress.stages[0].assessed, true);
  assert.equal(progress.stages[0].learning.completedLessons.length, 0);
  assert.equal(progress.stages[6].completed, false);
});
test("skill matching is transparent equal-weight counting and self-reported course practice cannot match intermediate roles", () => {
  const job = demoOpportunities[0];
  const profile = profileFor(["html", "css", "javascript", "git"]);
  const match = matchOpportunity(job, profile);
  assert.equal(match.percent, 80);
  assert.deepEqual(match.missing, ["react"]);
  const practice = profileFor([], { "frontend-course": { completedLessons: [0, 1, 2, 3, 4] } });
  assert.equal(matchOpportunity(job, practice).percent, 0);
});
const now = Date.parse("2026-10-14T00:00:00+07:00");
const mentor = demoIndustryMentors[0];
const slot = industrySlots(mentor, now)[0];
const booking = { mentorId: mentor.id, category: mentor.categories[0], slotId: slot.id, note: "Review my career direction" };
const wallet = { transactions: [{ id: "start", amount: 60 }], sessions: [] };
test("mentorship booking atomically charges demo wallet and cancellation refunds exactly once", () => {
  const booked = prepareIndustryBooking(wallet, booking, "book-1", now);
  assert.equal(booked.sessions[0].kind, "industry-mentorship");
  assert.equal(booked.transactions.reduce((sum, item) => sum + item.amount, 0), 40);
  assert.equal(wallet.sessions.length, 0);
  const cancelled = cancelIndustryBooking(booked, "book-1", now);
  assert.equal(cancelled.sessions[0].status, "Dibatalkan");
  assert.equal(cancelled.transactions.reduce((sum, item) => sum + item.amount, 0), 60);
  assert.equal(cancelIndustryBooking(cancelled, "book-1", now), cancelled);
});
test("invalid, expired, conflicting, and unaffordable mentoring bookings leave wallet unchanged", () => {
  assert.throws(() => prepareIndustryBooking({ ...wallet, transactions: [] }, booking, "no-credit", now), /Kredit/);
  assert.throws(() => prepareIndustryBooking(wallet, { ...booking, category: "unknown" }, "bad", now), /kategori/);
  assert.throws(() => prepareIndustryBooking(wallet, { ...booking, slotId: "2020-01-01/16:00" }, "old", now), /Jadwal/);
  const booked = prepareIndustryBooking(wallet, booking, "book-1", now);
  assert.throws(() => prepareIndustryBooking(booked, booking, "duplicate", now), /bertabrakan/);
  assert.equal(wallet.transactions[0].amount, 60);
});
test("mentorship sessions never masquerade as course progress", () => {
  const course = courseCatalog[0];
  const result = courseLearningProgress(course, [{ subject: course.title, kind: "industry-mentorship", startStep: 1, status: "Selesai" }]);
  assert.equal(result.completedLessons.length, 0);
});
test("certificates require issued records, passed session post-tests, and project approval", () => {
  const course = courseCatalog[0];
  const sessions = course.sessions.map((_, index) => ({ id: `s-${index}`, subject: course.title, startStep: index + 1, status: "Selesai" }));
  const learning = courseLearningProgress(course, sessions);
  const enrollment = { projectReview: { status: "approved" }, certificate: { id: "record-1", issuedAt: "2026-10-14", issuer: "Tutor.in" } };
  const assessments = sessions.map((session) => ({ sessionId: session.id, mode: "post", score: 80 }));
  assert.equal(eligibleCertificate(course, learning, enrollment, assessments).id, "record-1");
  assert.equal(eligibleCertificate(course, learning, { certificate: enrollment.certificate }, assessments), null);
  assert.equal(eligibleCertificate(course, learning, enrollment, assessments.slice(1)), null);
  assert.equal(eligibleCertificate(course, learning, { projectReview: enrollment.projectReview }, assessments), null);
});
test("public portfolio excludes private sections and projects, and export escapes content and unsafe links", () => {
  const state = { portfolio: { bio: "private bio", interests: "private interests", visibility: { introduction: false, skills: false, projects: true, certificates: false, learning: false, teaching: false } }, projects: [
    { title: '<script>alert(1)</script>', description: 'A <b>project</b>', technologies: "React", github: "javascript:alert(1)", demo: "https://example.com", skills: ["react"], visible: true },
    { title: "private project", description: "secret", visible: false },
  ] };
  const view = portfolioPublicData({ profile: { firstName: "Private", lastName: "Name", email: "secret@email.com" }, career: careerFor("frontend"), state, skills: [{ title: "HTML", level: 3 }], certificates: ["secret cert"], learning: ["secret course"], teaching: ["secret teaching"], achievements: ["secret badge"] });
  assert.equal(view.introduction, null); assert.deepEqual(view.skills, []); assert.equal(view.projects.length, 1);
  const html = portfolioHTML(view);
  assert.ok(!html.includes("private bio") && !html.includes("private project") && !html.includes("secret@email.com"));
  assert.ok(!html.includes("javascript:") && !html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;") && html.includes("https://example.com/"));
  assert.equal(safeURL("data:text/html,test"), "");
});
test("backend career storage validates bounded private data and excludes counterfeit certificates", () => {
  const body = { version: 1, target: "frontend", state: { skillAttempts: { html: attempt("html") }, projects: [], savedJobs: [], portfolio: { bio: "Learner", interests: "Web", visibility: { introduction: true, skills: true, projects: true, certificates: true, learning: true, teaching: false }, certificates: [{ id: "fake" }] }, certificates: [{ id: "fake" }] } };
  const valid = validateCareerData(body);
  assert.ok(valid); assert.equal(valid.state.certificates, undefined); assert.equal(valid.state.portfolio.certificates, undefined);
  assert.equal(validateCareerData({ ...body, target: "unknown" }), null);
  assert.equal(validateCareerData({ ...body, state: { ...body.state, projects: [{ id: "bad" }] } }), null);
});
