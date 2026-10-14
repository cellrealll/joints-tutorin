import assert from "node:assert/strict";
import test from "node:test";
import { getMentorProgress } from "../src/state/mentorProgress.js";

const now = new Date(2026, 9, 10, 12);
const session = (overrides = {}) => ({ role: "mentor", status: "Selesai", date: "2026-10-08", credits: 12, ...overrides });
const state = (sessions = [], transactions = []) => ({ sessions, transactions });

test("demo teaching history starts at Active Mentor and counts only completed teaching", () => {
  const result = getMentorProgress(state([session(), session({ date: "2026-10-05", credits: 24 }), session({ role: "mentee", credits: 100 }), session({ status: "Dikonfirmasi" }), session({ date: "2026-10-11" })]), now);
  assert.equal(result.credits, 340);
  assert.equal(result.currentIndex, 1);
  assert.equal(result.next.name, "Trusted Mentor");
  assert.equal(result.missions[0].value, 2);
  assert.equal(result.missions[2].value, 36);
});
test("weekly missions reset on Monday without resetting lifetime teaching credits", () => {
  const result = getMentorProgress(state([session({ date: "2026-10-04" }), session({ date: "2026-10-05" })]), now);
  assert.equal(result.week, "2026-10-05");
  assert.equal(result.credits, 328);
  assert.equal(result.missions[0].value, 1);
});
test("purchases and mission rewards do not increase mentor level", () => {
  const result = getMentorProgress(state([], [{ id: "purchase", amount: 2000 }, { id: "mentor-mission-2026-10-05-credits", amount: 3 }]), now);
  assert.equal(result.credits, 304);
  assert.equal(result.missions[2].claimed, true);
  assert.equal(result.missions[0].claimed, false);
});
test("reviews count only the current week and old claims do not carry over", () => {
  const result = getMentorProgress({ ...state([], [{ id: "mentor-mission-2026-09-28-sessions", amount: 3 }]), mentorReviews: [{ date: "2026-10-05" }, { date: "2026-10-04" }, { date: "2026-10-11" }] }, now);
  assert.equal(result.missions[1].value, 1);
  assert.equal(result.missions[0].claimed, false);
});
test("thresholds unlock and the final level has no next level", () => {
  assert.equal(getMentorProgress(state([session({ credits: 196 })]), now).currentIndex, 2);
  const final = getMentorProgress(state([session({ credits: 2000 })]), now);
  assert.equal(final.currentIndex, 4);
  assert.equal(final.next, undefined);
});
