# Drupal Learning Platform

A frontend-first learning workspace for the Drupal 7 AI Mentor described in the project brief. This first slice focuses on the learner dashboard, curriculum navigation, progress overview, and strict mentor interaction. The API, AI provider, persistent learner profile, grading pipeline, and sandbox are not connected yet; dashboard content is illustrative and chat replies are local demo behavior.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the sidebar to switch between the available lessons, start the current lesson, or try the mentor's quick actions.

## Build

```bash
npm run build
npm start
```

## Stack

- Next.js App Router, React, and TypeScript
- Custom responsive CSS, with reduced-motion support
- Lucide icons
