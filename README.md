# Drupal Learning Platform

A Drupal 7 learning workspace with a curated placement check, sequential lessons and graded day checkpoints, a server-side Gemini mentor, and PostgreSQL-backed learner progress.

## Run with Docker Compose

1. Copy `.env.example` to `.env` if you do not already have a local environment file. Set `GEMINI_API_KEY` for mentor chat and choose a local `POSTGRES_PASSWORD`. The environment file is ignored by Git.
2. Start the app and database:

   ```bash
   docker compose up --build
   ```

3. Open [http://localhost:3002](http://localhost:3002). The app waits for PostgreSQL, applies pending migrations, and then starts.

The Compose stack stores database data in the `postgres_data` named volume. `docker compose down` stops the services but preserves account and learner data. **Do not use `docker compose down -v` unless you intend to delete that data.**

## What works

- The placement assessment has 20 curated questions covering PHP, web basics, SQL, Git/CLI, and Drupal 7. Answers save after each selection; the server keeps the answer key, calculates category scores, and recommends a starting level.
- Recommendation rule: the average of PHP, web, SQL, and Git/CLI below 60% suggests Level 0 (foundations); at least 60% there but under 60% in Drupal suggests Level 1 (site building); at least 60% in both suggests Level 2 (module development). These are advisory starting points, not unlocks.
- Days 1–4 each have a day-end checkpoint; Days 2–4 contain three short lessons each. Lesson completion and checkpoint attempts persist in PostgreSQL.
- Lessons must be completed in order before the checkpoint opens. A score of at least 85% unlocks the next day; placement recommendations do not skip these day gates.
- Learners register with an email and a 12-character-minimum password. Passwords use scrypt hashing; opaque sessions are stored as hashes in PostgreSQL and sent in HttpOnly, SameSite cookies.
- Each account owns a separate learner profile, placement history, lesson progress, and checkpoint results. Learner APIs require a valid account session.
- Mentor chat streams from Gemini through `POST /api/chat`. Chat history is still held only in browser memory.

The current curriculum checkpoints are curated multiple-choice assessments, not executable coding exercises. Email verification, password recovery, and the Drupal sandbox are not implemented. Gemini teaches but never scores placement or grants progress.

Migration `0003_account_sessions.sql` intentionally deletes the old shared single-owner learner record and starts with empty accounts, as requested. After this migration, existing progress is not recoverable.

## Vercel deployment prerequisites

Before deploying, configure a hosted PostgreSQL database and set `DATABASE_URL` and `GEMINI_API_KEY` in Vercel's project environment. The Vercel build command applies pending database migrations, so the database user must be allowed to create and alter tables. Email verification and password recovery are not implemented; plan those before inviting a broad public audience.

## Environment variables

`.env.example` documents the local settings:

- `GEMINI_API_KEY` — server-side Gemini API key; never use a `NEXT_PUBLIC_` variable.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — local Compose database settings.
- `DATABASE_URL` — local Node development connection; Compose sets its internal service URL automatically.
- `APP_PORT` — host port for the app (defaults to `3002`).
- `DB_PORT` — loopback-only PostgreSQL port for local development (defaults to `5434`).

Keep real credentials in an ignored `.env` file. Do not paste keys into source code or commit them.

## Local development

Start the database with `docker compose up -d db`, set `DATABASE_URL` to `postgresql://<user>:<password>@localhost:<DB_PORT>/<database>` using the same values as the Compose variables, then run:

```bash
npm install
npm run db:migrate
npm run dev
```

## Production build

```bash
npm run build
npm start
```

The production build uses Next.js standalone output. The Docker image runs as a non-root user and applies database migrations before starting the server.

## Stack

- Next.js App Router, React, TypeScript
- PostgreSQL via `pg`
- Docker Compose for the app and database
- Gemini Flash through a server-only API route
