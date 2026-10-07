# Drupal Learning Platform

A frontend-first learning workspace for the Drupal 7 AI Mentor described in the project brief. This frontend includes separate Overview, Learning path, Practice lab, Mentor chat, and Skill profile pages. Progress and exercise content is illustrative; chat replies are local demo behavior, and the API, AI provider, persistent learner profile, grading pipeline, and Drupal sandbox are not connected yet.

## Pages

- `/overview` — daily progress and next steps
- `/learning` — the curriculum dashboard and lesson workspace
- `/practice` — queued hands-on exercise previews
- `/mentor` — standalone mentor chat demo
- `/skills` — competency breakdown and readiness

The Learning path puts the current code attempt, remaining attempts, pass mark, review debt, and level gate beside the mentor. The editor is a local draft only: no sandbox execution or score is claimed. The provided SVG wordmark and app icon are used in the sidebar and browser tab.

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
