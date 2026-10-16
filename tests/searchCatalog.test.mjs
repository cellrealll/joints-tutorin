import test from 'node:test';
import assert from 'node:assert/strict';
import { searchCatalog, courseMatchesSearch } from '../src/state/searchCatalog.js';
import { courseCatalog } from '../src/state/courseCatalog.js';

test('search finds courses, related skills and tutor names without case sensitivity', () => {
  assert.ok(searchCatalog(' FRONTEND ').some((item) => item.type === 'Course' && item.courseId === 'frontend-course'));
  assert.ok(searchCatalog('css').some((item) => item.type === 'Skill' && item.courseId === 'frontend-course'));
  assert.ok(searchCatalog('rafi ahmad').some((item) => item.type === 'Tutor' && item.tutor.name === 'Rafi Ahmad'));
  const frontend = courseCatalog.find((course) => course.id === 'frontend-course');
  assert.equal(courseMatchesSearch(frontend, 'react css'), true);
  assert.equal(courseMatchesSearch(frontend, 'unfindable-word'), false);
  assert.deepEqual(searchCatalog('   '), []);
  assert.deepEqual(searchCatalog('nonexistent-course-987654321'), []);
  assert.equal(new Set(searchCatalog('React').map((item) => item.id)).size, searchCatalog('React').length);
});
