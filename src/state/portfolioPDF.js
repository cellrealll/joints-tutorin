import { jsPDF } from 'jspdf';
import { safeURL } from './careerModel.js';

const colors = { ink: '#222454', muted: '#65736B', green: '#236647', pale: '#EDF7F0' };
const clean = (value) => String(value ?? '').replace(/\r\n/g, '\n').replace(/\p{Cc}/gu, (char) => char === '\n' || char === '\t' ? char : '');

// Input is the same visibility-filtered data used by the public preview.
export function createPortfolioPDF(data, fonts = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  let font = 'helvetica';
  if (fonts.regular && fonts.bold) {
    doc.addFileToVFS('NotoSans-Regular.ttf', fonts.regular);
    doc.addFileToVFS('NotoSans-Bold.ttf', fonts.bold);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    font = 'NotoSans';
  }
  const margin = 18, width = 174, bottom = 275;
  let y = 22;
  const name = data.introduction?.name || 'Learning Portfolio';
  doc.setProperties({ title: `${clean(name)} - Career Portfolio`, author: clean(name), creator: 'Tutor.in', subject: 'Learning portfolio' });
  function style(size, bold = false, color = colors.ink) {
    doc.setFont(font, bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(color);
  }
  function ensure(height) {
    if (y + height <= bottom) return;
    doc.addPage(); y = 24;
    style(8, true, colors.green); doc.text('TUTOR.IN / CAREER PORTFOLIO', margin, 14);
    doc.setDrawColor('#D8E7DC'); doc.line(margin, 18, margin + width, 18);
  }
  function paragraph(value, { size = 10, bold = false, color = colors.ink, url } = {}) {
    const text = clean(value);
    if (!text.trim()) return;
    style(size, bold, color);
    const lines = doc.splitTextToSize(text, width);
    const lineHeight = size * 0.3528 * 1.55;
    for (const line of lines) {
      ensure(lineHeight + 1); style(size, bold, color);
      doc.text(line, margin, y);
      if (url) doc.link(margin, y - size * 0.3528, Math.min(width, doc.getTextWidth(line)), lineHeight, { url });
      y += lineHeight;
    }
    y += 3;
  }
  function heading(title) {
    ensure(24); y += 6;
    doc.setFillColor(colors.green); doc.roundedRect(margin, y - 4, 2, 7, 1, 1, 'F');
    style(14, true, colors.green); doc.text(title, margin + 6, y + 1); y += 12;
  }
  style(9, true, colors.green); doc.text('TUTOR.IN / CAREER PORTFOLIO', margin, y); y += 13;
  paragraph(name, { size: 24, bold: true });
  if (data.introduction) {
    paragraph(data.introduction.career, { size: 13, bold: true, color: colors.green });
    paragraph(data.introduction.bio);
    if (data.introduction.interests) paragraph(`Minat profesional: ${data.introduction.interests}`, { color: colors.muted });
  }
  y += 3;
  doc.setDrawColor('#BCD9C6'); doc.line(margin, y, margin + width, y); y += 5;
  if (data.skills.length) {
    heading('Skills & technologies');
    for (const skill of data.skills) paragraph(`${skill.title} / ${['', 'Beginner', 'Intermediate', 'Advanced'][skill.level] || ''} / ${skill.source}`, { size: 10 });
  }
  if (data.projects.length) {
    heading('Projects');
    for (const project of data.projects) {
      ensure(25); paragraph(project.title, { size: 13, bold: true });
      if (project.image) {
        try {
          const image = doc.getImageProperties(project.image);
          const ratio = Math.min(width / image.width, 65 / image.height);
          const w = image.width * ratio, h = image.height * ratio;
          ensure(h + 8); doc.addImage(project.image, margin, y, w, h); y += h + 7;
        } catch { paragraph('Gambar proyek tidak tersedia.', { color: colors.muted }); }
      }
      paragraph(project.description);
      if (project.technologies) paragraph(`Teknologi: ${project.technologies}`);
      if (project.skills?.length) paragraph(`Related skills: ${project.skills.join(', ')} (catatan pemilik)`, { color: colors.muted });
      for (const [label, value] of [['GitHub', project.github], ['Live demo', project.demo]]) {
        const url = safeURL(value);
        if (url) paragraph(`${label}: ${url}`, { size: 9, color: colors.green, url });
      }
      y += 4;
    }
  }
  for (const [title, records] of [
    ['Learning records', data.certificates.map((record) => `${record.title} / ${record.id} / ${record.issuedAt}`)],
    ['Achievements', data.achievements], ['Learning experience', data.learning], ['Peer teaching', data.teaching],
  ]) {
    if (!records.length) continue;
    heading(title); for (const record of records) paragraph(record);
  }
  const count = doc.getNumberOfPages();
  for (let page = 1; page <= count; page++) {
    doc.setPage(page);
    doc.setDrawColor('#D8E7DC'); doc.line(margin, 282, margin + width, 282);
    style(7, false, colors.muted);
    doc.text('Portfolio belajar / salinan saat diunduh. Skills belum diverifikasi independen.', margin, 288);
    doc.text(`${page} / ${count}`, margin + width, 288, { align: 'right' });
  }
  return doc;
}

let fontPromise;
async function loadFonts() {
  if (!fontPromise) fontPromise = Promise.all(['Regular', 'Bold'].map(async (weight) => {
    const response = await fetch(`${import.meta.env?.BASE_URL || '/'}fonts/NotoSans-${weight}.ttf`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Font PDF belum dapat dimuat. Coba unduh kembali.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
    return btoa(binary);
  })).then(([regular, bold]) => ({ regular, bold })).catch((error) => { fontPromise = null; throw error; });
  return fontPromise;
}
export async function downloadPortfolioPDF(data) {
  const fonts = await loadFonts();
  const doc = createPortfolioPDF(data, fonts);
  const name = clean(data.introduction?.name || 'portfolio').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'portfolio';
  await doc.save(`tutorin-career-portfolio-${name}.pdf`, { returnPromise: true });
}
