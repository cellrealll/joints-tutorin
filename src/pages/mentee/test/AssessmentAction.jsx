import { useSyncExternalStore } from "react";
import AppIcon from "../../../components/common/AppIcon";
import { courseFor } from "./testData";
import { assessmentKey, assessmentResult, readAssessment, subscribeAssessments } from "./assessmentStorage";
import "./AssessmentAction.css";

export default function AssessmentAction({ sessionId, subject, courseId: providedCourseId, mode, onClick, buttonLabel, buttonClass = "activity-outline" }) {
  const courseId = providedCourseId || courseFor(subject);
  const key = assessmentKey(sessionId, courseId, mode);
  const raw = useSyncExternalStore(subscribeAssessments, () => readAssessment(key));
  const result = assessmentResult(raw, courseId, mode);
  if (!result) return <button className={buttonClass} type="button" onClick={onClick}>
    {buttonLabel}<AppIcon name="solar:arrow-right-linear" size={18} />
  </button>;
  return <div className="assessment-completed">
    <span className="assessment-completed-label"><AppIcon name="solar:check-circle-bold" size={15} />{mode === "pre" ? "Placement Test" : "Post-test"} selesai</span>
    <div className="assessment-completed-score"><span>Nilai</span><strong>{result.score}<small>/100</small></strong></div>
    <button className="assessment-review-button" type="button" onClick={onClick} aria-label={`Lihat pembahasan ${mode === "pre" ? "pre-test" : "post-test"}`}>
      Lihat pembahasan<AppIcon name="solar:arrow-right-linear" size={16} />
    </button>
  </div>;
}
