import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPortfolioPDF } from '../src/state/portfolioPDF.js';
import { portfolioPublicData } from '../src/state/portfolioModel.js';

const empty = () => ({ introduction: null, skills: [], projects: [], certificates: [], achievements: [], learning: [], teaching: [] });
test('portfolio export is a real PDF with text, links and multiple pages for long content', () => {
  const data = { ...empty(), introduction: { name: 'Anna Ratna', career: 'Frontend Developer', bio: 'Public introduction', interests: 'Web development' },
    projects: Array.from({ length: 5 }, (_, index) => ({ title: `Project ${index + 1}`, description: 'Detailed project description. '.repeat(100), technologies: 'React', skills: ['HTML', 'CSS'], github: 'https://github.com/example/project', demo: 'javascript:alert(1)', image: '' })) };
  const doc = createPortfolioPDF(data);
  assert.ok(doc.getNumberOfPages() > 1);
  const raw = doc.output();
  assert.ok(raw.startsWith('%PDF-'));
  assert.ok(raw.includes('/URI (https://github.com/example/project)'));
  assert.ok(!raw.includes('javascript:'));
  assert.equal(doc.getTextWidth('Project') > 0, true);
});

test('PDF exports only public sections and embeds the local Unicode fonts', () => {
  const state = { portfolio: { bio: 'PRIVATE BIO', interests: 'PRIVATE INTERESTS', visibility: { introduction: false, skills: false, projects: true, certificates: false, learning: false, teaching: false } }, projects: [
    { title: 'PRIVATE PROJECT', visible: false },
    { title: 'Public project', description: 'Public description', technologies: 'React', skills: ['html', 'css'], github: '', demo: '', image: '', visible: true },
  ] };
  const data = portfolioPublicData({ profile: { firstName: 'PRIVATE NAME', lastName: 'Hidden', email: 'secret@example.com' }, career: { title: 'Private career' }, state, skills: [], certificates: [], learning: ['PRIVATE LEARNING'], teaching: [], achievements: [] });
  const plain = createPortfolioPDF(data).output();
  for (const hidden of ['PRIVATE BIO', 'PRIVATE PROJECT', 'PRIVATE NAME', 'secret@example.com', 'PRIVATE LEARNING']) assert.ok(!plain.includes(hidden));
  const fonts = Object.fromEntries(['Regular', 'Bold'].map((weight) => [weight.toLowerCase(), readFileSync(new URL(`../public/fonts/NotoSans-${weight}.ttf`, import.meta.url)).toString('base64')]));
  const doc = createPortfolioPDF({ ...data, introduction: { name: 'Anna Ratna', career: 'Développeuse', bio: 'Résumé — portfolio', interests: '' } }, fonts);
  assert.ok(doc.output().startsWith('%PDF-'));
  assert.ok(doc.output().includes('/FontFile2'));
});
