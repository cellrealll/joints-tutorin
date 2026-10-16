import { useState } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { courses } from "./testData";
import useAssessment from "./useAssessment";
import Crossword from "./Crossword";
import { QuestionInput, SubmitTest, TestHeader, TestProgress, TestResult, TestTimer } from "./TestUI";
import "./Test.css";

export default function PostTest({ session, courseId, onBack }) {
  const [tab, setTab] = useState("crossword");
  const course = courses[courseId];
  const { attempt, update, submit, justSubmitted, remaining, saveStatus } = useAssessment(session.id, courseId, "post");
  const words = attempt.puzzle.words;
  const filledWords = words.filter((word) => word.cells.every((key) => attempt.cells[key])).length;
  const answered = course.post.filter((question, index) => question.type === "short" ? String(attempt.answers[index] || "").trim() : attempt.answers[index] !== undefined).length;
  const completed = filledWords + answered, total = words.length + course.post.length;
  return <div className="test-page">
    <TestHeader title="Post-test" subtitle="Rangkai kata, pecahkan soal, dan rayakan progres belajarmu." session={session} onBack={onBack} />
    {attempt.submitted ? <TestResult courseId={courseId} mode="post" attempt={attempt} celebrate={justSubmitted} onBack={onBack} /> : <>
      <div className="test-post-status"><TestProgress value={completed} total={total} label={`${completed} dari ${total} tantangan terisi`} /><TestTimer remaining={remaining} /></div>
      <div className="test-mode-tabs" role="tablist" aria-label="Bagian post-test" onKeyDown={(event) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const next = event.key === "Home" ? "crossword" : event.key === "End" ? "quiz" : tab === "crossword" ? "quiz" : "crossword";
          setTab(next); document.getElementById(`${next}-tab`).focus();
        }
      }}>
        <button role="tab" id="crossword-tab" aria-controls="post-test-panel" aria-selected={tab === "crossword"} tabIndex={tab === "crossword" ? 0 : -1} onClick={() => setTab("crossword")}><AppIcon name="solar:widget-linear" size={19} />Crossword<span>{filledWords}/{words.length}</span></button>
        <button role="tab" id="quiz-tab" aria-controls="post-test-panel" aria-selected={tab === "quiz"} tabIndex={tab === "quiz" ? 0 : -1} onClick={() => setTab("quiz")}><AppIcon name="solar:lightbulb-linear" size={19} />Tantangan<span>{answered}/{course.post.length}</span></button>
      </div>
      <div id="post-test-panel" role="tabpanel" aria-labelledby={tab === "crossword" ? "crossword-tab" : "quiz-tab"}>
        {tab === "crossword" ? <Crossword puzzle={attempt.puzzle} cells={attempt.cells} onChange={(cells) => update({ cells })} /> : <div className="test-mixed-questions">
          {course.post.map((question, index) => <section className="test-mixed-question" key={index} aria-labelledby={`post-question-${index}`}>
            <span className="test-eyebrow">Tantangan {index + 1} / {question.type === "short" ? "Jawaban singkat" : question.options.length === 2 ? "Benar atau salah" : "Pilihan ganda"}</span>
            <h2 id={`post-question-${index}`}>{question.prompt}</h2>
            <QuestionInput question={question} value={attempt.answers[index]} name={`post-${index}`} onChange={(value) => update((current) => ({ answers: { ...current.answers, [index]: value } }))} />
          </section>)}
        </div>}
      </div>
      <footer className="test-footer"><span role="status">{saveStatus}</span><div className="test-footer-actions">
        {tab === "crossword" && <button className="activity-outline" onClick={() => setTab("quiz")}>Lanjut tantangan<AppIcon name="solar:arrow-right-linear" size={18} /></button>}
        <SubmitTest unanswered={total - completed} onSubmit={submit} />
      </div></footer>
    </>}
  </div>;
}
