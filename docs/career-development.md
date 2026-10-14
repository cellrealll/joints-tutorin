# Career development extension

The React application retains its existing page navigation, AppIcon, activity cards, course catalog, enrollment storage, assessment storage, profile, and credit ledger. Career pages use the same target career stored by Career Roadmap.

## Data and proficiency

`careerSkills.js` defines formative competency questions, prerequisites, target learning levels, and course-module mappings. `careerModel.js` derives proficiency and transparent opportunity matching. Existing programming pre-tests supply programming-logic evidence at question level; their overall score never proves HTML, CSS, React, design, or communication proficiency. Course self-reports contribute Beginner practice evidence. A project technology tag never changes skill proficiency.

Only Advanced assessment evidence with all prerequisites mastered permits skipping a contiguous prefix of supported course lessons. Final projects cannot be skipped by assessment. Roadmap assessment milestones represent demonstrated foundational knowledge, not course certificates.

Course enrollment also reuses a completed pre-test from an identical existing question bank, rather than requiring the same questions again. Such a total score still does not permit skipping individual technical competencies.

## Prototype and production boundaries

`careerDemoData.js` contains fictional mentors, companies, schedules, and opportunities, labeled as demonstrations in the interface. No real mentorship or application is submitted. Demo mentorship confirmation atomically charges the existing local wallet; cancellation refunds once. Bookings appear in the existing course/session list and detail page. Conflicting schedules and insufficient credits are rejected.

Browser career state uses `tutorin-career-v1`. Course progress remains in its existing enrollment/session sources. Portfolio exports respect section and per-project visibility, omit contact details and wallet/assessment answers, escape HTML, and accept only HTTP(S) links. Exported HTML files are snapshots, not hosted or revocable public links. Uploaded project images are limited to PNG/JPEG/WebP and 1 MB.

Certificates are displayed only when an issued Tutor.in record exists, all numbered lesson sessions have passing post-tests (70+), all lessons are complete, and the final project has approval. The UI does not issue official certificates or permit self-approval.

## Existing backend integration

The existing Express/Sequelize backend now includes `CareerProfile`, associated with `User`, and private authenticated `GET /api/career/profile` and `PUT /api/career/profile` endpoints. Writes validate versioned, bounded career data and strip unrelated certificate fields. Existing server startup sync creates the new table using the project's existing database configuration; no database connection or migration was run during local implementation.

When an authenticated host flow supplies the existing backend JWT as `{ "token": "..." }` in `localStorage['tutorin-auth']` and sets `VITE_API_URL=http://localhost:5000/api`, Portfolio shows explicit account save/load controls. The present frontend has no login integration, so its default remains the existing local prototype. Account loads require confirmation before replacing career data. There is no automatic upload or public portfolio endpoint. Do not put a JWT in an environment variable.

## Validation

Run `node --test tests/*.test.mjs` and `npm run build`. New model tests cover competency evidence, prerequisite-based skipping, matching, credit/refund integrity, privacy/export escaping, certificate eligibility, and backend payload validation. Backend database execution requires the existing configured MySQL service; it is separate from local UI testing.
