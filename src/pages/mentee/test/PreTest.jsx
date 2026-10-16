import AppIcon from "../../../components/common/AppIcon";
import { answeredQuestion, courses } from "./testData";
import useAssessment from "./useAssessment";
import { QuestionInput, SubmitTest, TestHeader, TestProgress, TestResult, TestTimer } from "./TestUI";
import "./Test.css";

export default function PreTest({ session, courseId, onBack, onPostTest }) {
  const course = courses[courseId];
  const { attempt, update, submit, justSubmitted, remaining, saveStatus } = useAssessment(session.id, courseId, "pre");
  const index = attempt.current;
  const question = course.pre[index];
  const answered = course.pre.filter((item, number) => answeredQuestion(item, attempt.answers[number])).length;
  const flagged = attempt.flags.includes(index);
  function answer(value) { update((current) => ({ answers: { ...current.answers, [index]: value } })); }
  return <div className="test-page">
    <TestHeader title="Placement Test" subtitle="Temukan titik mulai belajarmu lewat konsep, studi kasus, dan tantangan praktik." session={session} onBack={onBack} />
    {attempt.submitted ? <TestResult courseId={courseId} mode="pre" attempt={attempt} celebrate={justSubmitted} onBack={onBack} onPostTest={onPostTest} /> : <>
      <TestProgress value={answered} total={course.pre.length} label={`${answered} dari ${course.pre.length} soal terjawab`} />
      <div className="test-pre-layout">
        <section className="test-question" aria-labelledby="pre-question-title">
          <div className="test-question-meta"><span className="test-eyebrow">{course.title} / {course.topic}</span><div className="test-question-top-actions"><span>{index + 1} / {course.pre.length}</span>
            <button className="test-flag-button" aria-pressed={flagged} title={flagged ? "Hapus tanda soal" : "Tandai soal"} onClick={() => update((current) => ({ flags: flagged ? current.flags.filter((item) => item !== index) : [...current.flags, index] }))}><AppIcon name={flagged ? "solar:flag-bold" : "solar:flag-linear"} size={17} />{flagged ? "Ditandai" : "Tandai soal"}</button>
          </div></div>
          <h2 id="pre-question-title">{question.prompt}</h2>
          {question.type === "code" && <span className="test-practice-label"><AppIcon name="solar:code-2-bold" size={16} />Tantangan kode · {question.language}</span>}
          <QuestionInput question={question} value={attempt.answers[index]} onChange={answer} name={`pre-${index}`} />
          <div className="test-question-tools">
            <button onClick={() => update((current) => ({ answers: Object.fromEntries(Object.entries(current.answers).filter(([key]) => Number(key) !== index)) }))} disabled={attempt.answers[index] === undefined}><AppIcon name="solar:restart-linear" size={17} />Hapus pilihan</button>
            <div className="test-paging">
              <button className="test-icon-button" aria-label="Soal sebelumnya" title="Soal sebelumnya" disabled={index === 0} onClick={() => update({ current: index - 1 })}><AppIcon name="solar:arrow-left-linear" size={22} /></button>
              <button className="test-icon-button primary" aria-label="Soal berikutnya" title="Soal berikutnya" disabled={index === course.pre.length - 1} onClick={() => update({ current: index + 1 })}><AppIcon name="solar:arrow-right-linear" size={22} /></button>
            </div>
          </div>
        </section>
        <aside className="test-sidebar"><TestTimer remaining={remaining} />
          <section className="test-navigator"><h2>Navigasi soal</h2><div className="test-number-grid">{course.pre.map((item, number) => <button key={number} aria-label={`Soal ${number + 1}${answeredQuestion(item, attempt.answers[number]) ? ", terjawab" : ""}${attempt.flags.includes(number) ? ", ditandai" : ""}`} aria-current={number === index ? "step" : undefined}
            data-answered={answeredQuestion(item, attempt.answers[number])} data-flagged={attempt.flags.includes(number)} onClick={() => update({ current: number })}>{number + 1}{attempt.flags.includes(number) && <span aria-hidden="true" className="test-flag-dot" />}</button>)}</div>
            <div className="test-legend"><span><i className="answered" />Terjawab</span><span><i className="flagged" />Ditandai</span></div>
            <SubmitTest unanswered={course.pre.length - answered} onSubmit={submit} />
          </section>
        </aside>
      </div>
      <footer className="test-footer"><span role="status">{saveStatus}</span></footer>
    </>}
  </div>;
}
