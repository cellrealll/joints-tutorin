import assert from "node:assert/strict";
import test from "node:test";
import { canJoinSession } from "../src/pages/mentee/sesi/sessionUtils.js";
import { ensureTodayZoomSessions, normalizeZoomInvite } from "../src/state/zoomMeeting.js";

test("only Zoom meeting invitations can be saved", () => {
  assert.equal(normalizeZoomInvite(" https://us05web.zoom.us/j/123456789?pwd=secret "), "https://us05web.zoom.us/j/123456789?pwd=secret");
  assert.equal(normalizeZoomInvite("https://zoom.us/my/tito.mentor"), "https://zoom.us/my/tito.mentor");
  for (const value of ["https://zoom.us.evil.example/j/123", "http://zoom.us/j/123", "https://user:pass@zoom.us/j/123", "javascript:alert(1)", "https://zoom.us/profile", "https://zoom.new"]) {
    assert.equal(normalizeZoomInvite(value), null);
  }
});

test("today's mentor and mentee sessions open now and share one Zoom link", () => {
  const now = Date.parse("2026-10-16T02:16:00Z");
  const sessions = ensureTodayZoomSessions([], now);
  assert.equal(sessions.length, 2);
  assert.deepEqual(sessions.map((item) => item.role), ["mentee", "mentor"]);
  for (const session of sessions) {
    assert.equal(session.date, "2026-10-16");
    assert.equal(canJoinSession(session, now), true);
  }
  const saved = sessions.map((session) => ({ ...session, zoomUrl: "https://zoom.us/j/123456789?pwd=abc" }));
  assert.equal(ensureTodayZoomSessions(saved, now + 60000).every((session) => session.zoomUrl === saved[0].zoomUrl), true);
  assert.equal(ensureTodayZoomSessions(saved, now + 86400000).every((session) => session.zoomUrl === ""), true);
  const startedAt = new Date(now).toISOString();
  const started = saved.map((session) => ({ ...session, startedAt }));
  assert.equal(ensureTodayZoomSessions(started, now + 60000).every((session) => session.startedAt === startedAt), true);
  assert.equal(ensureTodayZoomSessions(started, now + 86400000).every((session) => session.startedAt === null), true);
});
