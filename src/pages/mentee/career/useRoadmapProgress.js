import { useSyncExternalStore } from "react";
import { useTutorData } from "../../../state/tutorStore";
import { useEnrollments } from "../../../state/enrollments";
import { useRoadmap } from "../../../state/roadmapStore";
import { courseCatalog } from "../../../state/courseCatalog";
import { roadmapProgress } from "../../../state/learningProgress";
import { assessmentKey, assessmentResult, readAssessment, subscribeAssessments } from "../test/assessmentStorage";
import { careerFor } from "./roadmapData";
import { useCareerState } from "../../../state/careerStore";
import { buildSkillProfile, hasMastery, skillAnalysis } from "../../../state/careerModel";
import { sessionsForCourse } from "../../../state/learningProgress";
import { courseFor } from "../test/testData";

export default function useRoadmapProgress() {
  const data = useTutorData();
  const enrollments = useEnrollments();
  const roadmap = useRoadmap();
  const career = careerFor(roadmap.target);
  const careerState = useCareerState();
  const contexts = courseCatalog.flatMap((course) => {
    const placementBank = courseFor(course.title) || course.courseId;
    return [{ sessionId: course.id, bank: placementBank, mode: "pre", title: course.title },
      ...(placementBank !== course.courseId ? [{ sessionId: course.id, bank: course.courseId, mode: "pre", title: course.title }] : []),
      ...sessionsForCourse(course, data.sessions).flatMap((session) => ["pre", "post"].map((mode) =>
        ({ sessionId: session.id, bank: session.courseId || course.courseId, mode, title: course.title })))];
  });
  // A primitive snapshot stays stable when unrelated assessment drafts change.
  const raw = useSyncExternalStore(subscribeAssessments, () => JSON.stringify(contexts.map((context) =>
    readAssessment(assessmentKey(context.sessionId, context.bank, context.mode)))));
  const attempts = JSON.parse(raw);
  const assessments = contexts.flatMap((context, index) => {
    const result = assessmentResult(attempts[index], context.bank, context.mode);
    const logicCorrect = context.mode === "pre" && ["programming", "frontend", "backend"].includes(context.bank)
      ? [0, 3, 4, 5, 6, 9].filter((index) => result?.items[index]?.correct).length : 0;
    return result ? [{ ...context, score: result.score, logicLevel: context.mode === "pre" ? logicCorrect >= 5 ? 3 : logicCorrect >= 3 ? 2 : 1 : 0 }] : [];
  });
  const profile = buildSkillProfile(careerState.skillAttempts, courseCatalog, data.sessions, enrollments, assessments);
  const masteredSkills = Object.keys(profile).filter((id) => hasMastery(id, profile));
  const progress = roadmapProgress(career, courseCatalog, data.sessions, enrollments, roadmap.practiced, masteredSkills);
  const analysis = skillAnalysis(career.id, profile);
  return { career, progress, assessments: assessments.filter((item) => career.milestones.some((stage) => stage.courseId === item.sessionId || stage.courseId === courseCatalog.find((course) => course.title === item.title)?.id)), allAssessments: assessments, enrollments, data, roadmap, profile, analysis, careerState };
}
