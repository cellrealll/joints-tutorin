import assert from "node:assert/strict";
import { test } from "node:test";
import { courses, courseFor, createPuzzle, gradeTest, placementLevel, correctQuestion } from "../src/pages/mentee/test/testData.js";

test("session subjects select the appropriate assessment bank", () => {
  for (const [subject, expected] of [["Algoritma dan Pemrograman", "programming"], ["Fisika", "physics"], ["Matematika Diskrit", "discrete"], ["Kalkulus", "calculus"], ["Aljabar Linear", "algebra"], ["Matematika", "algebra"], ["Frontend Web Development", "frontend"], ["Backend API Engineering", "backend"], ["UI/UX Product Design", "uiux"], ["Public Speaking for Work", "speaking"]]) {
    assert.equal(courseFor(subject), expected);
  }
  assert.equal(courseFor("Biologi"), null);
});

for (const [courseId, course] of Object.entries(courses)) {
  test(`${courseId}: valid placement questions and accurate grading`, () => {
    assert(course.pre.length >= 10);
    course.pre.forEach((question) => assert(question.type === "code" ? question.solutions.length > 0 : question.options[question.correct] !== undefined));
    const answers = Object.fromEntries(course.pre.map((question, index) => [index, question.correct]));
    const attempt = { answers, questionCount: course.pre.length };
    assert.equal(gradeTest(courseId, "pre", attempt).score, 100);
    assert.equal(gradeTest(courseId, "pre", { answers: {}, questionCount: course.pre.length }).score, 0);
    delete answers[0];
    assert.equal(gradeTest(courseId, "pre", attempt).score, Math.round((course.pre.length - 1) / course.pre.length * 100));
  });
  test(`${courseId}: crossword intersections, positions, and mixed-question grading`, () => {
    const puzzle = createPuzzle(courseId), cells = {};
    assert(puzzle.words.length >= 4);
    const positions = new Map();
    for (const word of puzzle.words) {
      assert(word.row >= 0 && word.col >= 0);
      assert.equal(word.cells.length, word.answer.length);
      for (const [index, key] of word.cells.entries()) {
        const [row, col] = key.split(":").map(Number);
        assert(row < puzzle.rows && col < puzzle.cols);
        if (cells[key]) assert.equal(cells[key], word.answer[index], `Conflict at ${key}`);
        cells[key] = word.answer[index];
      }
      if (positions.has(word.cells[0])) assert.equal(positions.get(word.cells[0]), word.position);
      positions.set(word.cells[0], word.position);
    }
    const answers = Object.fromEntries(course.post.map((question, index) => [index, question.type === "short" ? ` ${question.correct} ` : question.correct]));
    assert.equal(gradeTest(courseId, "post", { answers, cells, puzzle }).score, 100);
    assert.equal(gradeTest(courseId, "post", { answers: {}, cells: {}, puzzle }).score, 0);
    answers[2] = "9999";
    assert.equal(gradeTest(courseId, "post", { answers, cells, puzzle }).correct, puzzle.words.length + 2);
  });
}

test("programming placement includes code and preserves scores from completed ten-question drafts", () => {
  for (const bank of ["programming", "frontend", "backend"]) assert.equal(courses[bank].pre.filter((question) => question.type === "code").length, 5);
  for (const bank of ["programming", "frontend", "backend", "uiux", "speaking"]) assert.equal(courses[bank].pre.length, 15);
  const codingQuestion = courses.programming.pre.find((question) => question.type === "code");
  assert.equal(correctQuestion(codingQuestion, ` ${codingQuestion.solutions[0].replaceAll('"', "'")} `), true);
  assert.equal(correctQuestion(codingQuestion, "return numbers;"), false);
  const oldAnswers = Object.fromEntries(courses.programming.pre.slice(0, 10).map((question, index) => [index, question.correct]));
  assert.equal(gradeTest("programming", "pre", { submitted: true, answers: oldAnswers }).score, 100);
  assert.equal(placementLevel(35), "Beginner");
  assert.equal(placementLevel(60), "Intermediate");
  assert.equal(placementLevel(80), "Advanced");
});
