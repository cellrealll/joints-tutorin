import assert from "node:assert/strict";
import test from "node:test";
import { canJoinSession, compareSessionSchedule, isUpcomingSession, sessionStart, sessionStatus } from "../src/pages/mentee/sesi/sessionUtils.js";
import { demoOpeningCredits, migrateDemoCredits } from "../src/state/creditLedger.js";

const session = { id: "session-1", date: "2026-10-14", time: "10:00", duration: 120, status: "Dikonfirmasi" };

test("join opens exactly ten minutes before the WIB schedule and closes at session end", () => {
  const start = Date.parse("2026-10-14T03:00:00Z");
  assert.equal(sessionStart(session), start);
  assert.equal(canJoinSession(session, start - 600001), false);
  assert.equal(canJoinSession(session, start - 600000), true);
  assert.equal(canJoinSession(session, start), true);
  assert.equal(canJoinSession(session, start + 120 * 60000 - 1), true);
  assert.equal(canJoinSession(session, start + 120 * 60000), false);
});

test("confirmed session shows Sedang sesi during its scheduled window", () => {
  const start = sessionStart(session);
  assert.equal(sessionStatus(session, start - 1), "Dikonfirmasi");
  assert.equal(sessionStatus(session, start), "Sedang sesi");
  assert.equal(sessionStatus(session, start + session.duration * 60000 - 1), "Sedang sesi");
  assert.equal(sessionStatus(session, start + session.duration * 60000), "Terlewat");
});

test("pending, completed, and cancelled sessions cannot join", () => {
  for (const status of ["Menunggu konfirmasi", "Selesai", "Dibatalkan"]) {
    assert.equal(canJoinSession({ ...session, status }, sessionStart(session)), false);
  }
});
test("mentee waits until the mentor explicitly starts the scheduled session", () => {
  const now = sessionStart(session);
  const learning = { ...session, role: 'mentee', zoomUrl: 'https://zoom.us/j/123456789' };
  assert.equal(sessionStatus(learning, now), 'Menunggu mentor');
  assert.equal(sessionStatus({ ...learning, startedAt: new Date(now).toISOString() }, now), 'Sedang sesi');
});

test("dashboard and Courses select the same nearest active session including tied times", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-10-14T02:55:00Z"));
  const sessions = [
    { ...session, id: "later", date: "2026-10-15" },
    { ...session, id: "cancelled", time: "09:00", status: "Dibatalkan" },
    { ...session, id: "z-teaching", role: "mentor" },
    { ...session, id: "a-learning" },
    { ...session, id: "finished", time: "07:00" },
  ];
  const dashboard = sessions.filter(isUpcomingSession).sort(compareSessionSchedule)[0];
  const courses = sessions.filter(isUpcomingSession).sort((a, b) => compareSessionSchedule(a, b));
  assert.equal(dashboard.id, "a-learning");
  assert.equal(dashboard.id, courses[0].id);
  assert.equal(courses.length, 3);
});

test("demo credit correction keeps every chronological balance nonnegative and preserves purchases", () => {
  const transactions = [
    { id: "tx-1", title: "Saldo awal", detail: "Kredit belajar Tutor.in", amount: 60 },
    ...[-10, 10, -58, 64, -96, -82, 58, -72].map((amount, i) => ({ id: `tx-${i + 2}`, amount })),
    { id: "purchase", amount: 100 },
  ];
  const old = { transactions, sessions: [session] };
  const fixed = migrateDemoCredits(old);
  let balance = 0;
  for (const item of fixed.transactions) {
    balance += item.amount;
    assert.ok(balance >= 0);
  }
  assert.equal(fixed.transactions[0].amount, demoOpeningCredits);
  assert.equal(balance, 160);
  assert.equal(fixed.transactions.at(-1), transactions.at(-1));
  assert.equal(fixed.sessions, old.sessions);
  assert.equal(old.transactions[0].amount, 60);
  assert.equal(migrateDemoCredits(fixed), fixed);
});

test("credit migration leaves non-demo balances untouched", () => {
  const transactions = [{ id: "own-opening", title: "Saldo awal", amount: 20 }];
  assert.deepEqual(migrateDemoCredits({ transactions }).transactions, transactions);
});
