import { useEffect, useState } from "react";
import { createPuzzle } from "./testData";
import { assessmentKey, saveAssessment } from "./assessmentStorage";

function newAttempt(courseId, mode) {
  const now = Date.now();
  return { version: 1, courseId, mode, answers: {}, cells: {}, flags: [], current: 0, submitted: false,
    deadline: now + (mode === "pre" ? 15 : 12) * 60000, puzzle: mode === "post" ? createPuzzle(courseId) : null };
}
function loadAttempt(key, courseId, mode) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.version === 1 && saved.courseId === courseId && saved.mode === mode && saved.answers && saved.cells &&
      Array.isArray(saved.flags) && Number.isFinite(saved.deadline) && (mode !== "post" || saved.puzzle?.words?.length)) {
      return { ...saved, current: Math.max(0, Math.min(9, Number(saved.current) || 0)), submitted: saved.submitted || saved.deadline <= Date.now(),
        timedOut: saved.timedOut || (!saved.submitted && saved.deadline <= Date.now()) };
    }
  } catch { /* A damaged draft must not prevent opening an assessment. */ }
  return newAttempt(courseId, mode);
}

export default function useAssessment(sessionId, courseId, mode) {
  const key = assessmentKey(sessionId, courseId, mode);
  const [attempt, setAttempt] = useState(() => loadAttempt(key, courseId, mode));
  const [clock, setClock] = useState(Date.now);
  const [saveStatus, setSaveStatus] = useState("Menyimpan jawaban...");
  useEffect(() => {
    let status;
    try { saveAssessment(key, attempt); status = "Jawaban tersimpan di browser"; }
    catch { status = "Jawaban belum tersimpan. Periksa izin penyimpanan browser."; }
    const timer = setTimeout(() => setSaveStatus(status), 0);
    return () => clearTimeout(timer);
  }, [attempt, key]);
  useEffect(() => {
    if (attempt.submitted) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setClock(now);
      setAttempt((current) => now >= current.deadline ? { ...current, submitted: true, timedOut: true } : current);
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt.submitted]);

  function update(patch) {
    setAttempt((current) => {
      if (current.submitted) return current;
      if (Date.now() >= current.deadline) return { ...current, submitted: true, timedOut: true };
      return { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
    });
  }
  function submit() { update({ submitted: true }); }
  return { attempt, update, submit, saveStatus, remaining: Math.max(0, Math.ceil((attempt.deadline - clock) / 1000)) };
}
