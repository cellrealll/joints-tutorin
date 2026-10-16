import test from 'node:test';
import assert from 'node:assert/strict';
import { initialActivity } from '../src/state/activitySeed.js';
import { completedDemoCourseId, withCompletedDemoCourse } from '../src/state/completedCourseDemo.js';
import { courseCatalog } from '../src/state/courseCatalog.js';
import { courseLearningProgress } from '../src/state/learningProgress.js';

test('one completed example course has every lesson, feedback, and no extra charges', () => {
  const activity = initialActivity();
  const course = courseCatalog.find((course) => course.id === completedDemoCourseId);
  const learning = courseLearningProgress(course, activity.sessions);
  assert.equal(learning.percent, 100);
  assert.equal(learning.completedSessions.length, course.sessions.length);
  assert.equal(new Set(activity.sessions.map((session) => session.id)).size, activity.sessions.length);
  assert.equal(Object.keys(activity.courseCompletions).length, 1);
  const feedback = activity.courseCompletions[course.id];
  assert.equal(feedback.score, 92);
  assert.ok(feedback.strengths.length && feedback.improvement && feedback.nextStep);
  assert.equal(withCompletedDemoCourse(activity), activity);
  const ledger = [{ id: 'balance', amount: 100 }];
  const migrated = withCompletedDemoCourse({ sessions: [], transactions: ledger });
  assert.deepEqual(migrated.transactions, ledger);
  assert.equal(courseLearningProgress(course, migrated.sessions).percent, 100);
});
