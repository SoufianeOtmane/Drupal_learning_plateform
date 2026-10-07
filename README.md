# Drupal Learning Platform

A learning workspace for the Drupal 7 AI Mentor described in the project brief. It includes separate Overview, Learning path, Practice lab, Mentor chat, Skill profile, and Project guide pages. The chat uses a server-side Gemini streaming route; learner metrics remain sample data, and persistent storage, objective grading, and Drupal sandbox execution are not connected yet.

## Pages

- `/overview` — daily progress and next steps
- `/learning` — the curriculum dashboard and lesson workspace
- `/practice` — queued hands-on exercise previews
- `/mentor` — standalone Gemini-powered mentor chat
- `/skills` — competency breakdown and readiness
- `/guide` — learning workflow and backend implementation plan

The Learning path puts the current code attempt, remaining attempts, pass mark, review debt, and level gate beside the mentor. The editor is a local draft only: no sandbox execution or score is claimed. The provided SVG wordmark and app icon are used in the sidebar and browser tab.

## Gemini API setup

1. Revoke any API key that has been pasted into chat, a ticket, or source control. Create a replacement Gemini API key.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to the replacement. `.env.local` is ignored by Git.
3. Restart `npm run dev`; chat requests go through `POST /api/chat`. The key is only read in the server route and is never sent to browser code.

The API route validates message count and size, applies the strict Drupal 7 mentor instructions, and streams Gemini Flash output to the chat UI. Requests fail with a visible configuration message until a key is set. Never use a `NEXT_PUBLIC_` variable for the key.

## Recommended backend plan

- **Language/runtime:** TypeScript on Next.js Route Handlers for the app API, matching the existing frontend.
- **Database:** PostgreSQL for learner profiles, curriculum, attempts, mastery, chat history, review scheduling, and audit records.
- **Grading/sandbox:** isolated Docker worker images with Drupal 7, PHP 7.4, and MariaDB; no outbound network, strict limits, and automated tests/security checks.
- **Next modules:** persistence and authentication, curriculum/progress APIs, deterministic grading, attempt limits and spaced repetition, sandbox lifecycle, then admin/content tools and observability.
- Keep sandbox execution isolated from the web process. The LLM explains results; automated checks decide pass/fail.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the sidebar to move between the workspace pages, start the current lesson, or try the mentor's quick actions.

## Build

```bash
npm run build
npm start
```

## Stack

- Next.js App Router, React, and TypeScript
- Custom responsive CSS, with reduced-motion support
- Lucide icons
