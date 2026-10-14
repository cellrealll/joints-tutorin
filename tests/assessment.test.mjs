import assert from "node:assert/strict";
import { test } from "node:test";
import { courses, courseFor, createPuzzle, gradeTest } from "../src/pages/mentee/test/testData.js";

test("session subjects select the appropriate assessment bank", () => {
  for (const [subject, expected] of [["Algoritma dan Pemrograman", "programming"], ["Fisika", "physics"], ["Matematika Diskrit", "discrete"], ["Kalkulus", "calculus"], ["Aljabar Linear", "algebra"], ["Matematika", "algebra"]]) {
    assert.equal(courseFor(subject), expected);
  }
  assert.equal(courseFor("Biologi"), null);
});

for (const [courseId, course] of Object.entries(courses)) {
  test(`${courseId}: ten valid pre-test questions and accurate grading`, () => {
    assert.equal(course.pre.length, 10);
    course.pre.forEach((question) => assert(question.options[question.correct] !== undefined));
    const answers = Object.fromEntries(course.pre.map((question, index) => [index, question.correct]));
    assert.equal(gradeTest(courseId, "pre", { answers }).score, 100);
    assert.equal(gradeTest(courseId, "pre", { answers: {} }).score, 0);
    delete answers[0];
    assert.equal(gradeTest(courseId, "pre", { answers }).score, 90);
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
