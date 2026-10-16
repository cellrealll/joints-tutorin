import { courseCatalog } from './courseCatalog.js';
import { tutors } from './tutors.js';
import { careerSkills } from './careerSkills.js';

const normalize = (value) => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const terms = (query) => normalize(query).trim().split(/\s+/).filter(Boolean);
export function courseMatchesSearch(course, query) {
  const skills = Object.values(careerSkills).filter((skill) => skill.courseId === course.id).map((skill) => skill.title);
  const text = normalize([course.title, course.description, course.category, course.field, ...course.sessions, ...skills, ...course.tutors.flatMap((tutor) => [tutor.name, tutor.subjects])].join(' '));
  return terms(query).every((term) => text.includes(term));
}
export function searchCatalog(query) {
  const words = terms(query);
  if (!words.length) return [];
  const matches = (text) => words.every((word) => normalize(text).includes(word));
  const courses = courseCatalog.filter((course) => courseMatchesSearch(course, query)).map((course) => ({ id: `course:${course.id}`, type: 'Course', label: course.title, detail: course.category, courseId: course.id }));
  const skills = Object.entries(careerSkills).filter(([, skill]) => matches(skill.title)).map(([id, skill]) => ({ id: `skill:${id}`, type: 'Skill', label: skill.title, detail: courseCatalog.find((course) => course.id === skill.courseId)?.title || '', courseId: skill.courseId }));
  const uniqueTutors = [...new Map([...tutors, ...courseCatalog.flatMap((course) => course.tutors)].map((tutor) => [tutor.name, tutor])).values()];
  const mentors = uniqueTutors.filter((tutor) => matches(`${tutor.name} ${tutor.subjects}`)).map((tutor) => ({ id: `tutor:${tutor.name}`, type: 'Tutor', label: tutor.name, detail: tutor.subjects, tutor }));
  return [...skills, ...courses, ...mentors].slice(0, 10);
}
