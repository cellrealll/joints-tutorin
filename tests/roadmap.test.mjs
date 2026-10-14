import assert from "node:assert/strict";
import test from "node:test";
import { courseCatalog } from "../src/state/courseCatalog.js";
import { courseLearningProgress, roadmapProgress, sessionsForCourse } from "../src/state/learningProgress.js";
import { careerFor, careerRoadmaps } from "../src/pages/mentee/career/roadmapData.js";

const frontend = courseCatalog.find((course) => course.id === "frontend-course");
const session = (patch = {}) => ({ id: "learning-1", subject: frontend.title, courseId: "programming", role: "mentee", status: "Selesai", startStep: 1, ...patch });

test("all five career paths have eight milestones linked to existing courses and valid lessons", () => {
  assert.equal(careerRoadmaps.length, 5);
  for (const career of careerRoadmaps) {
    assert.equal(career.milestones.length, 8);
    assert.equal(new Set(career.milestones.map((stage) => stage.id)).size, 8);
    for (const stage of career.milestones) {
      const course = courseCatalog.find((item) => item.id === stage.courseId);
      assert.ok(course, `${career.id}/${stage.id} must link to a real course`);
      for (const lesson of stage.lessons) assert.ok(Number.isInteger(lesson) && course.sessions[lesson]);
      if (!stage.lessons.length) assert.ok(stage.relatedNote, "Supplemental practice must explain catalog limitations");
    }
  }
  assert.equal(careerFor("unknown").id, "frontend");
});

test("course identity excludes teaching and unrelated courses sharing the programming assessment bank", () => {
  const activity = [session(), session({ id: "mentor", role: "mentor" }), session({ id: "design", subject: "UI/UX Product Design" }), session({ id: "mismatch", catalogCourseId: "backend-course" })];
  assert.deepEqual(sessionsForCourse(frontend, activity).map((item) => item.id), ["learning-1"]);
});

test("finished numbered sessions and learner records merge without double-counting", () => {
  const result = courseLearningProgress(frontend, [session(), session({ id: "repeat" }), session({ id: "pending", status: "Menunggu konfirmasi", startStep: 3 }), session({ id: "cancelled", status: "Dibatalkan", startStep: 4 })], { completedLessons: [0, 1, 1, -1, 99, "2"] });
  assert.deepEqual(result.completedLessons, [0, 1]);
  assert.deepEqual(result.sessionLessons, [0]);
  assert.equal(result.percent, 25);
});

test("legacy finished sessions with no lesson number are activity, not completed courses", () => {
  const result = courseLearningProgress(frontend, [session({ startStep: undefined })]);
  assert.equal(result.completedSessions.length, 1);
  assert.equal(result.unassignedSessions, 1);
  assert.equal(result.percent, 0);
});

test("roadmap advances sequentially and requires every lesson for multi-lesson stages", () => {
  const career = careerFor("frontend");
  const initial = roadmapProgress(career, courseCatalog, [], {});
  assert.equal(initial.percent, 0);
  assert.equal(initial.stages[0].status, "ongoing");
  assert.ok(initial.stages.slice(1).every((stage) => stage.status === "locked"));
  const progress = roadmapProgress(career, courseCatalog, [session()], { [frontend.id]: { completedLessons: [1, 2, 3] } });
  assert.equal(progress.completed, 3);
  assert.equal(progress.percent, 38);
  assert.equal(progress.next.id, "git");
  assert.equal(progress.stages[4].done, 1);
  assert.equal(progress.stages[4].completed, false);
});

test("manual supplemental practice stays scoped by career and shared course learning survives target changes", () => {
  const enrollments = { [frontend.id]: { registered: true, completedLessons: [0, 1, 2, 3, 4, 5] } };
  const practice = ["frontend:git"];
  const progress = roadmapProgress(careerFor("frontend"), courseCatalog, [], enrollments, practice);
  assert.equal(progress.completed, 6);
  assert.equal(progress.next.id, "portfolio");
  const mobile = roadmapProgress(careerFor("mobile"), courseCatalog, [], enrollments, practice);
  assert.equal(mobile.stages[0].completed, true);
  assert.equal(mobile.stages[1].completed, true);
  assert.equal(mobile.stages[2].completed, false);
  const again = roadmapProgress(careerFor("frontend"), courseCatalog, [], enrollments, practice);
  assert.equal(again.percent, progress.percent);
});

test("all completed milestones give 100 percent and undoing practice returns the correct next step", () => {
  const enrollments = Object.fromEntries(courseCatalog.map((course) => [course.id, { completedLessons: course.sessions.map((_, index) => index) }]));
  const career = careerFor("frontend");
  const finished = roadmapProgress(career, courseCatalog, [], enrollments, ["frontend:git"]);
  assert.equal(finished.percent, 100);
  assert.equal(finished.next, null);
  const undone = roadmapProgress(career, courseCatalog, [], enrollments);
  assert.equal(undone.next.id, "git");
  assert.equal(undone.percent, 88);
});
