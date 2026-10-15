import test from "node:test";
import assert from "node:assert/strict";
import { mentorCertificates, formatTeachingTime } from "../src/state/mentorCertificates.js";

test("certificates use only completed mentor sessions and group teaching by subject", () => {
  const sessions = [
    { id: "a", role: "mentor", status: "Selesai", subject: "UI/UX", date: "2026-10-10", duration: 90, learner: "Raka" },
    { id: "b", role: "mentor", status: "Selesai", subject: "UI/UX", date: "2026-10-12", duration: 60, learner: "Nadia" },
    { id: "c", role: "mentor", status: "Dikonfirmasi", subject: "UI/UX", date: "2026-10-13", duration: 120 },
    { id: "d", role: "mentee", status: "Selesai", subject: "Frontend", date: "2026-10-10", duration: 120 },
    { id: "e", role: "mentor", status: "Selesai", subject: "Python", date: "2026-10-16", duration: 120 },
  ];
  const certificates = mentorCertificates(sessions, "2026-10-15");
  assert.equal(certificates.length, 1);
  assert.equal(certificates[0].subject, "UI/UX");
  assert.equal(certificates[0].sessions, 2);
  assert.equal(certificates[0].minutes, 150);
  assert.equal(certificates[0].issuedAt, "2026-10-12");
  assert.match(certificates[0].id, /^TIN-M-[A-Z0-9]{7}$/);
  assert.equal(formatTeachingTime(150), "2 jam 30 menit");
});

test("certificate ID stays stable when a new session is completed", () => {
  const first = { id: "first", role: "mentor", status: "Selesai", subject: "React", date: "2026-10-10", duration: 60 };
  const additional = { id: "next", role: "mentor", status: "Selesai", subject: "React", date: "2026-10-11", duration: 60 };
  assert.equal(mentorCertificates([first], "2026-10-15")[0].id, mentorCertificates([additional, first], "2026-10-15")[0].id);
});
