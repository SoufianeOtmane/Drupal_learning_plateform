# Cahier des charges – Drupal 7 AI Mentor

*Personal learning SaaS: a strict, adaptive AI chatbot that takes you from zero to professional Drupal 7 developer in 30 days.*

Version 1.0 · Single-user (owner) · Language of the app: English (French optional)

## 1. Project overview

### 1.1 Vision

Drupal 7 AI Mentor is not a static course. It is a conversational coach that decides what you learn next, gives you real exercises, runs your code in a real Drupal 7 sandbox, grades it strictly, and refuses to let you advance until you really master the current level.

### 1.2 Goals

- Become professional in Drupal 7 (site building, module development, theming, performance, security, maintenance) in **30 days**.
- Learn by doing: roughly 80% practice, 20% explanation.
- Be strict: objective, automated grading plus AI code review. No "good enough" passes.
- Be adaptive: the difficulty, pace and content change depending on your results.
- Feel alive: a fluid, animated, game-like interface with progress, streaks and feedback.

### 1.3 Scope

- In scope: Drupal 7 core, contrib essentials (Views, CCK/Field API, Panels, Features, Rules, Webform, Pathauto, Token, Entity API, Ctools, Drush), PHP needed for Drupal, MySQL basics, theming, hooks, Form API, Database API, Render API, security, performance, deployment, migration awareness (D7 to newer versions).
- Out of scope (v1): multi-user accounts, payments, public marketplace, mobile native app.

### 1.4 Important note on Drupal 7

Drupal 7 reached official end of life on January 5, 2025. It is still widely used in legacy projects and through vendor extended support, so the skill remains valuable for maintenance jobs. The platform must therefore also teach: how to secure and maintain an aging D7 site, and how to plan a migration to a modern Drupal version.

### 1.5 Target user

One user (the owner). Assumed starting point: some web knowledge (HTML/CSS, a bit of PHP). A placement test at the start confirms or corrects this.

## 2. Functional requirements

### 2.1 Onboarding and placement test (F-01)

- First launch: a 20 to 30 question diagnostic (PHP, HTML/CSS, SQL, Git, Linux CLI, Drupal concepts) mixing quiz and small code tasks.
- Output: a skill map (radar chart) and a starting level. The AI generates a personalised 30-day plan.
- The user sets daily availability (e.g. 3h, 5h, 8h). The plan is adapted to it, and the platform warns if 30 days is unrealistic for that availability.

### 2.2 AI mentor chatbot (F-02)

The chatbot is the main interface. It must:

- Open each day with a briefing: what was learned, what is weak, today's objective.
- Teach concepts in short steps (explain, show example, ask a check question), never walls of text.
- Give exercises, hints (3 progressive levels), and review submissions.
- Answer free questions about Drupal 7 at any time, then bring the user back to the plan.
- Stay strict: refuse to hand over full solutions before an honest attempt; refuse to skip levels; call out sloppy code, bad practices and security holes.
- Use a configurable personality (Strict Mentor by default, Hard Mode optional).
- Support Markdown, code blocks with syntax highlighting, diagrams, and streaming responses.
- Remember context: past mistakes, weak topics, pace, preferences (long-term memory stored in DB).

### 2.3 Curriculum engine (F-03)

- Structure: 5 Levels, 30 Days, about 120 Lessons and 150+ Exercises (see section 4).
- Each lesson contains: objective, prerequisites, concept explanation, annotated code, real-world use case, common mistakes, mini quiz.
- Each level ends with a **Level Gate**: a boss challenge that must be passed with the minimum score to unlock the next level.
- Dependency graph: a lesson unlocks only when its prerequisites are mastered.
- Spaced repetition: weak items return as review cards at day +1, +3, +7, +14.

### 2.4 Exercise system (F-04)

Exercise types:

1. **Quiz** (single/multiple choice, ordering, fill-in-the-blank).
2. **Code exercise** (write a hook, a module, a function) with automated tests.
3. **Site-building exercise** (configure content types, fields, views, roles) verified by a script that inspects the sandbox database/config.
4. **Debug exercise** (a broken module/site is given; find and fix the bug).
5. **Code review exercise** (spot the security or performance issue in a snippet).
6. **Theming exercise** (modify a template/preprocess; visual and DOM assertions).
7. **Real-world project** (mini-projects: blog, event site, directory, e-commerce-lite).
8. **Timed challenge** (Level Gates and "Speed Run" mode).

Each exercise has: difficulty (1 to 5), estimated time, learning objectives, starter code, hidden tests, rubric, hints, reference solution (shown only after passing or after the allowed attempts), and tags.

### 2.5 Strict grading engine (F-05)

Every submission receives a score out of 100 made of:

- **Functional correctness (50%)**: automated tests pass in the sandbox.
- **Code quality (20%)**: PHP\_CodeSniffer with the Drupal coding standard, naming, structure, comments.
- **Security (15%)**: input sanitisation (check\_plain, filter\_xss), db\_query placeholders, access callbacks, CSRF tokens via Form API.
- **Best practices (10%)**: use of the right API (Field API, Form API, Render API), no hacking core, no direct SQL when an API exists, hook placement.
- **Efficiency (5%)**: caching, query count, no queries in loops.

Rules:

- Pass mark per exercise: **80/100** (Level Gates: **85/100**).
- Any critical security flaw (SQL injection, XSS, missing access control) is an automatic fail, regardless of score.
- Maximum 3 attempts before a mandatory "reteach" mini-lesson; hints cost points (hint 1: -3, hint 2: -6, hint 3: -10).
- Cheating protection: the AI never reveals the hidden tests; solution viewing marks the exercise as "not mastered" and schedules a fresh variant later.
- The AI explains every lost point precisely (line, rule, reason, fix).
- Mastery model: a skill becomes "mastered" only after passing it at 80+ on two different exercises at least a day apart.

### 2.6 Sandbox environment (F-06)

- Each exercise runs in an isolated Docker container with Drupal 7 (latest 7.x), PHP 7.4 (or 8.1 for compatibility lessons), MariaDB/MySQL, Drush 8, Apache/Nginx, Xdebug optional.
- Pre-built Drupal 7 snapshot images per exercise for instant start (< 5 seconds).
- In-browser editor (Monaco) with PHP/Twig-less syntax highlighting, file tree, terminal (Drush and limited shell), and live preview of the site in an iframe.
- Resource limits: CPU, memory, time (30 s per test run), no outbound network, auto-destroy after inactivity.
- Reset button to restore the starting state.
- Downloadable project (zip) at the end of any mini-project.

### 2.7 Progress and gamification (F-07)

- XP, levels, daily streak, badges (e.g. "Hook Master", "Security Aware", "Views Wizard").
- Skill radar (Site building, Module dev, Theming, Security, Performance, DevOps).
- Timeline of the 30 days with colour states (done, today, late, locked).
- Readiness score: "estimated job-readiness %".
- Daily goals and weekly reports (strengths, weaknesses, forecast to finish on time).
- Strictness features: a missed day triggers a recovery plan; two missed days trigger a plan rescheduling and a warning.

### 2.8 Adaptive learning (F-08)

- Real-time difficulty adjustment based on success rate, time taken, hints used, and error types.
- Error classification (conceptual, syntax, API misuse, security, logic) feeding targeted remediation exercises.
- If the user is ahead: harder variants and bonus topics. If behind: simplified steps and extra practice before the Level Gate.
- Generation of fresh exercise variants by the AI, validated by a test harness before being shown (never show an exercise whose reference solution fails its own tests).

### 2.9 Knowledge base and reference (F-09)

- Built-in searchable cheat sheets: hooks list, Form API elements, Database API, Render API, Field API, Views handlers, Drush commands, security checklist.
- Glossary and "explain this code" feature: paste any D7 code and get a line-by-line explanation.
- RAG over a local index of Drupal 7 API docs (api.drupal.org D7 reference) so the AI answers with accurate function signatures and avoids hallucinations. Every answer on API details should cite the source function/page.

### 2.10 Review, notes and export (F-10)

- Personal notes attached to lessons; bookmarks.
- Mistake notebook: all failed exercises with the explanation and a re-attempt button.
- Export: progress report (PDF), notes (Markdown), portfolio of finished mini-projects.
- Final certification: a 4-hour capstone exam; on passing, a personal "Drupal 7 Professional" report.

### 2.11 Interview and professional prep (F-11)

- Mock interview mode: technical questions, live coding, and scenario questions ("a client site was hacked, what do you do?").
- Freelance/job module: estimating tasks, client communication, writing technical documentation, code review etiquette.

### 2.12 Settings (F-12)

- AI provider selection and API keys, fallback order, model choice per task.
- Strictness level (Strict / Hard / Brutal), hints on/off, theme (dark/light), animation intensity, sound, language.
- Data export/import (backup of all progress).

## 3. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | First meaningful paint < 2 s; chat first token < 2 s; sandbox start < 5 s; test run < 30 s |
| Interactivity | Streaming AI answers, optimistic UI, no full page reloads |
| Animation | 60 fps target; Framer Motion / GSAP; reduced-motion setting respected |
| Reliability | Automatic AI provider failover; graceful degradation to offline mode with exercises still solvable |
| Security | Sandboxed code execution (no network, read-only root FS, unprivileged user, seccomp); API keys stored server-side only; rate limiting; input validation |
| Privacy | All data belongs to the owner; local-first option (SQLite) |
| Maintainability | Modular monolith, typed code (TypeScript), exercise definitions as versioned YAML/JSON files in Git |
| Observability | Structured logs, token usage dashboard, error tracking |
| Accessibility | Keyboard navigation, readable contrast, screen-reader labels |
| Cost | Run at 0 € for the AI part during v1 (free tiers), low-cost VPS or local machine for hosting |

## 4. Curriculum: 5 levels in detail (30 days)

### Level 0 – Foundations check (Day 1)

- PHP essentials as used in Drupal: arrays (very heavily used), functions, includes, string handling, OOP basics, superglobals.
- Web basics: HTTP, request lifecycle, MySQL basics, Git, command line, local environment (Docker/Lando or XAMPP), Composer awareness.
- Gate: placement test + environment working.

### Level 1 – Drupal 7 user and site builder (Days 2 to 7)

- **Day 2**: Install Drupal 7, directory structure (sites/all, sites/default, modules, themes), settings.php, update.php, cron, status report.
- **Day 3**: Content types, nodes, fields (Field API UI), text formats, file/image fields, taxonomy and vocabularies.
- **Day 4**: Users, roles, permissions, access control strategy, blocks and regions, menus, input filters.
- **Day 5**: Views fundamentals: displays, filters, contextual filters, relationships, exposed filters, fields vs. rows, caching, pagers.
- **Day 6**: Contrib essentials: Pathauto, Token, Ctools, Panels basics, Webform, Media/File entity concepts, Wysiwyg, Redirect, Metatag; how to evaluate a contrib module (maintenance status, security advisories, usage).
- **Day 7**: Drush mastery (site install, dl/en, cc all, sql-dump, updb, features), configuration export with Features, backup/restore, **Level 1 Gate**: build a complete "Events site" from a written brief within 3 hours, graded by a config-inspection script.
- Use cases: corporate site, blog, event listing, simple intranet.

### Level 2 – Module developer (Days 8 to 16)

- **Day 8**: Anatomy of a module (.info, .module, .install), naming, coding standards, hooks concept, hook\_help, hook\_menu basics.
- **Day 9**: hook\_menu in depth: page callbacks, access callbacks, menu types, arguments, wildcard loaders, tabs, local actions.
- **Day 10**: Form API: element types, validation, submit handlers, #states, AJAX (#ajax), multistep forms, form\_alter, system\_settings\_form.
- **Day 11**: Database API: db\_select, db\_insert, db\_update, db\_merge, db\_query with placeholders, dynamic queries, query alter, joins, transactions, schema API, hook\_schema, hook\_update\_N.
- **Day 12**: Render API and theming functions: render arrays, #theme, hook\_theme, theme(), #attached, #cache, drupal\_render, page alter.
- **Day 13**: Entity and Field API: hook\_entity\_info, entity load/save, EntityFieldQuery, custom fields (hook\_field\_info, widgets, formatters), hook\_node\_\* family, Entity API contrib module, metadata wrappers.
- **Day 14**: Blocks API (hook\_block\_info/view), hook\_permission, user and role APIs, variable\_get/set, hook\_cron, queue API, batch API, hook\_mail, drupal\_mail.
- **Day 15**: Views API for developers (custom handlers, hook\_views\_api, default views), Ctools plugins, Rules integration, hook\_token\_info.
- **Day 16**: **Level 2 Gate**: build a custom module from specs (custom entity or content workflow with admin form, permissions, block, cron task, update hook), graded by automated tests, standards, and security checks.
- Use cases: custom registration workflow, API integration, import/export tool, custom dashboard.

### Level 3 – Themer and front-end integrator (Days 17 to 21)

- **Day 17**: Theme anatomy (.info, template.php, tpl.php, regions), theme hook suggestions, template naming, base themes (Bartik, Omega, Zen), sub-theming.
- **Day 18**: Preprocess/process functions, theme\_\* overrides, field templates, node and block templates, views templates, html.tpl.php and page.tpl.php.
- **Day 19**: CSS/JS management (drupal\_add\_css/js, libraries API, #attached), jQuery in Drupal (Drupal.behaviors, Drupal.settings, once), AJAX framework commands.
- **Day 20**: Responsive design, image styles and responsive images (Picture module), accessibility, Sass/Compass in themes, front-end performance.
- **Day 21**: **Level 3 Gate**: convert a provided HTML/CSS design into a fully working responsive D7 theme with overrides, graded by DOM assertions, screenshots comparison and standards check.

### Level 4 – Professional: security, performance, operations (Days 22 to 27)

- **Day 22**: Security I – OWASP in Drupal context: XSS (check\_plain, check\_markup, filter\_xss), SQL injection, CSRF (form tokens), access bypass, file upload risks, secure permission design, Security Review module.
- **Day 23**: Security II – hardening: settings.php protection, input formats, user 1 policy, brute-force protection, updates (SA-CORE advisories), vulnerability triage on legacy D7 sites, patching strategy.
- **Day 24**: Performance – page cache, block cache, Views cache, Boost, Memcache/Redis, APC/OPcache, query optimisation, slow query log, devel/webprofiler, aggregation, CDN.
- **Day 25**: Deployment and DevOps – Git workflow, Features/Strongarm for config management, Drush make, environments, backups, cron and queues, multisite, upgrade of PHP versions for D7, logging, monitoring.
- **Day 26**: Testing and quality – SimpleTest module testing, test-driven mini-projects, debugging with Xdebug and devel, coding standards, code review, documentation.
- **Day 27**: **Level 4 Gate**: audit and repair a hacked/slow legacy D7 site (given a broken sandbox): find vulnerabilities, fix, optimise, document findings in a report.
- Use cases: hacked site recovery, high traffic news site, scaled multi-environment pipeline.

### Level 5 – Professional certification (Days 28 to 30)

- **Day 28**: Migration and upgrade strategy – Migrate module (D7 to D7/D10), planning an upgrade path, content audit, data mapping, headless/decoupled awareness, risk assessment for clients on legacy D7.
- **Day 29**: Mock interviews, estimation, client scenarios, architecture trade-offs, writing documentation and handover notes.
- **Day 30**: **Capstone exam (4h)**: deliver a complete small product (spec + custom module + theme + security hardening + deployment notes). Pass mark 85/100. Output: certification report with strengths/weaknesses and a recommended 90-day maintenance plan.

### 4.1 Daily rhythm (default 6h/day)

1. 10 min – AI briefing and spaced-repetition review.
2. 60 min – Guided lesson (explain, demo, check questions).
3. 3h – Hands-on exercises with grading.
4. 60 min – Mini-project step.
5. 30 min – Daily test + AI debrief (what was weak, what is tomorrow).

## 5. AI design

### 5.1 Roles

- **Mentor agent**: conversation, teaching, motivation, strictness.
- **Grader agent**: structured code review against the rubric (JSON output with scores, issues, line numbers).
- **Exercise generator agent**: creates variants from templates, always validated by running the reference solution through tests.
- **Planner agent**: builds and re-balances the 30-day plan from the skill map.
- **Interviewer agent**: mock interviews.

### 5.2 Prompting rules

- System prompt defines persona (strict, precise, professional), forbids giving full solutions early, requires Drupal 7 only (never Drupal 8+ syntax unless in the migration lessons), requires security-first examples.
- Responses structured as JSON for grading and for UI components (quiz card, hint card, lesson card), free text for chat.
- Grounding: retrieve relevant API doc chunks (RAG) and the user's learner profile before each call.
- Guardrails: automatic check that suggested code uses valid D7 functions (static function-name check against an API index) to catch hallucinated functions.
- Token economy: caching of lesson content, short context window (summaries of old turns), cheap models for chat, stronger models for grading.

### 5.3 Learner model

Stored per skill: mastery (0 to 1), confidence, last practised, error types, average time, hints used. Used by the planner, the exercise picker and the spaced-repetition scheduler.

## 6. Free AI API options (for now)

Free tiers change often, so verify limits in each provider's console before relying on them. Findings as of the latest sources (mid-2026):

| Provider | What you get free | Comment |
| --- | --- | --- |
| **Google Gemini API (AI Studio)** | Current Flash models free, no credit card; limits depend on your project | Best first choice: large context, good for lessons and code review. Pro models moved to paid in April 2026 |
| **Groq** | Free tier, no card, about 30 requests/min and around 1,000 requests/day on some models (e.g. gpt-oss-120b, Llama) | Extremely fast; ideal for the live chat; watch token-per-minute caps |
| **OpenRouter** | About 14 free models, 50 requests/day (more after a small credit purchase) | Great as a fallback and for trying many models |
| **Mistral (free mode)** | Free tier, no card | Good fallback, solid at code |
| **Cloudflare Workers AI** | 10,000 Neurons/day | Useful for small tasks (classification, summaries) |
| **Cerebras / SambaNova** | Limited free tiers (e.g. around 200K tokens/day per model on SambaNova) | Backup options |

Note: Anthropic does not publish a free API tier, and premium flagship models from the big providers are now paid.

**Recommended setup**

1. Primary: Gemini Flash (lessons, grading, planning).
2. Chat speed: Groq.
3. Fallbacks: OpenRouter free models, then Mistral.
4. Build an **LLM gateway** module with one interface, automatic failover, per-provider rate-limit tracking, response caching, and key rotation. This also lets you plug in a paid model later with a single config change.
5. Local option: Ollama with a code model (e.g. Qwen2.5-Coder or similar) for offline or unlimited use if your PC has enough RAM/GPU.

Important: grading must never depend only on the LLM. The LLM explains and reviews; the **test harness decides pass/fail**.

## 7. Technical architecture

### 7.1 Recommended stack (solo developer friendly)

- **Frontend**: Next.js (React, TypeScript), Tailwind CSS, Framer Motion for animations, Monaco Editor, xterm.js terminal, Recharts for radar/progress charts, Zustand for state.
- **Backend**: Node.js (NestJS or Fastify) or Python FastAPI; WebSocket/SSE for streaming.
- **Database**: PostgreSQL (or SQLite for local-first); Redis for queues, caching and rate limiting; pgvector (or Qdrant) for RAG.
- **Sandbox runner**: Docker with a pool of pre-warmed Drupal 7 containers (optionally gVisor/Firecracker later), orchestrated by a small runner service.
- **Content**: exercises and lessons as YAML/Markdown in a Git repo, loaded into the DB at build time.
- **Hosting**: local Docker Compose first; later a VPS (Hetzner or similar).

### 7.2 Main modules

Auth/settings, Curriculum, Exercise runner, Grader, LLM gateway, Mentor chat, Learner model, Spaced repetition, RAG indexer, Gamification, Notes/export, Admin tools.

### 7.3 Data model (main tables)

- `learner_profile` (goals, availability, strictness, language)
- `skill` (id, name, parent, level) and `learner_skill` (mastery, last\_practised, error\_stats)
- `lesson` (id, level, day, title, content\_ref, prerequisites)
- `exercise` (id, type, difficulty, skill\_ids, spec\_ref, rubric, tests\_ref)
- `attempt` (id, exercise\_id, submitted\_files, score\_breakdown, ai\_feedback, hints\_used, duration, passed)
- `chat_session` / `chat_message` (role, content, metadata)
- `memory` (long-term facts about the learner)
- `review_card` (skill/exercise, next\_due, interval)
- `plan_day` (date, planned\_items, status)
- `achievement`, `streak`, `note`, `llm_usage`

### 7.4 Key API endpoints

- `POST /chat` (SSE streaming), `GET /plan/today`, `POST /plan/replan`
- `GET /lessons/:id`, `GET /exercises/:id`, `POST /exercises/:id/start-sandbox`
- `POST /exercises/:id/submit` returns score breakdown, issues, feedback
- `POST /exercises/:id/hint`, `GET /progress`, `GET /reviews/due`
- `POST /exam/start`, `POST /interview/start`
- `GET/PUT /settings`, `GET /usage`

### 7.5 Grading pipeline

1. Copy submission into a fresh sandbox container.
2. Run Drush enable/install steps, then functional tests (SimpleTest or custom PHP/curl scripts) and DB/config inspection.
3. Run PHPCS (Drupal standard) and a custom security linter (regex/AST checks for unsafe patterns).
4. Collect metrics (queries count, time).
5. Send results plus code to the Grader agent for explanation; combine into the final score.
6. Store the attempt, update learner model and schedule review cards.

## 8. UX/UI requirements (dynamic and "moving")

- **Main layout**: left sidebar (30-day map), center chat/lesson, right panel (editor, preview, terminal) with resizable panes.
- **Dashboard**: animated progress ring, streak flame, skill radar, today's missions, readiness score.
- **Animations**: page transitions, typing/streaming effect, XP counters, confetti or glow on passing, shake on failure, animated level-unlock sequence, animated skill graph (nodes lighting up).
- **Interactive lesson elements**: collapsible code explanations, hover tooltips on functions, step-by-step execution visualisations (e.g. Drupal request lifecycle, hook invocation order, Form API flow) as animated diagrams.
- **Chat quick actions**: "Hint", "Explain again", "Show example", "Test me", "Skip" (skip is refused by strict mode).
- **Modes**: Focus mode (hide everything but the task), Speed Run, Review mode, Exam mode (no hints, timer).
- **Dark theme by default**, keyboard shortcuts, command palette (Ctrl+K).
- **Responsive**: usable on a tablet for reading lessons; coding mainly on desktop.

## 9. Strictness policy (summary)

- Daily minimum: 1 lesson + 3 exercises + 1 daily test, or the day counts as failed.
- No advancing without passing the Level Gate.
- Late-day penalty on XP; streak reset after a missed day.
- Brutal mode: no hints, 90/100 pass mark, time limits on every exercise.
- The mentor gives honest, direct feedback (never flattery), always followed by a concrete fix and next step.

## 10. Quality and testing

- Unit tests for grading, scheduler and planner; integration tests for the sandbox runner.
- Validation script that runs every exercise's reference solution to ensure tests pass (CI).
- Prompt regression tests: a set of fixed submissions whose expected grades must stay in range.
- Manual review of the first 2 weeks of generated content for D7 accuracy.

## 11. Delivery roadmap

| Phase | Duration | Content |
| --- | --- | --- |
| 0. Setup | 2 days | Repo, Docker Drupal 7 image, LLM gateway with Gemini + Groq |
| 1. MVP | 2 weeks | Chat mentor, 10 days of curriculum, quiz + code exercises, sandbox, basic grading, progress dashboard |
| 2. Core | 2 weeks | Full 30-day content, strict grading pipeline, spaced repetition, planner, Level Gates |
| 3. Polish | 1 week | Animations, gamification, notes/export, RAG over D7 docs |
| 4. Pro features | 1 week | Mock interviews, capstone exam, usage dashboard, backups |

Tip: you can start learning with the MVP while building the rest, using the platform on itself.

## 12. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Free API limits reached | Multi-provider gateway, caching, smaller models for chat, local Ollama fallback |
| AI hallucinating non-existent D7 functions | RAG over D7 API docs, function-name validator, tests decide pass/fail |
| AI generating Drupal 8+ code | Strict system prompt, static checker for namespaces/Twig/services patterns |
| Unsafe code execution | Hardened Docker (no network, resource caps, non-root), later gVisor |
| Content creation effort is huge | Generate content with AI, validate through the CI harness, human review only for key lessons |
| 30 days too short | Placement test, honest readiness score, 30-day plan can stretch to 45 or 60 days with warning |
| Legacy D7 and PHP compatibility | Pin PHP 7.4 image for training; include a PHP 8.x compatibility lesson |

## 13. Acceptance criteria (v1)

- A new user completes the placement test and receives a personalised 30-day plan.
- The chatbot teaches a lesson, assigns an exercise, and refuses a bad submission with precise, line-level feedback.
- Code runs in an isolated Drupal 7 sandbox and the score comes from automated tests plus coding-standard and security checks.
- A critical security flaw always fails an exercise.
- Level Gates block progression until passed.
- The AI provider switches automatically when one hits its limit.
- Progress, streaks, skill radar and review cards persist and update in real time.
- The UI is animated and responsive with streaming chat.

## 14. Next steps

1. Validate this specification (adjust daily hours, strictness, stack).
2. Get free API keys: Google AI Studio and Groq first.
3. Build the Docker Drupal 7 sandbox image and a first exercise with hidden tests.
4. Build the LLM gateway and the chat endpoint.
5. Produce the first 3 days of curriculum and test the full learning loop end to end.

# Addendum v1.1 – Becoming the reference platform for Drupal 7

This addendum extends the specification above. Where it conflicts with an earlier section, the addendum wins.

## 15. Positioning and ambition

- Goal: the most complete and most realistic Drupal 7 training platform, built around **real production problems**, not only textbook features.
- Principle: every lesson ends with a "what breaks in production" question. Learning is measured by whether you can **diagnose, fix, and prevent**, not only build.
- Honest timeline: the 30-day programme makes you **employable and productive**. Becoming a true expert is reached with a continuous **Mastery Phase** (section 21) of incident labs, audits and projects after day 30.
- Long-term vision: a multi-version platform (Drupal 7, then 8/9, 10/11, Backdrop, Acquia/Pantheon hosting) sharing one engine (section 20).

## 16. Performance and caching track (new, mandatory)

Performance becomes its own track of 5 days inside Level 4, with graded labs on a deliberately slow Drupal 7 site.

### 16.1 Topics

- Drupal 7 cache layers: page cache, block cache, Views query/output cache, render cache (#cache), entity cache, field cache, variable cache, `cache_clear_all`, cache bins and `cache_get/cache_set`.
- Anonymous vs authenticated traffic, cache invalidation, why `hook_init` and `$_SESSION` kill page caching.
- Back ends: Memcache, Redis, APC/OPcache, Boost, Varnish (headers, `Cache-Control`, purge), CDN.
- Database: slow query log, `EXPLAIN`, missing indexes, N+1 queries in loops, `node_load_multiple`, heavy Views (relationships, sorts on non-indexed fields), `cache_form` and `watchdog` table bloat, `sessions` and `semaphore` issues.
- PHP/runtime: OPcache config, memory\_limit, max\_execution\_time, cron overload, queue workers, `drupal_http_request` blocking.
- Front end: CSS/JS aggregation, image styles, lazy loading, critical CSS, HTTP/2, caching headers.
- Tooling: devel (query log), Webprofiler, XHProf/Blackfire concepts, New Relic basics, Apache Bench / k6 / JMeter load testing.

### 16.2 Graded performance labs

| Lab | Scenario | Pass condition |
| --- | --- | --- |
| P1 | Homepage takes 8 s with 400 queries | Under 1.5 s, under 60 queries, no feature lost |
| P2 | Views block with 3 relationships times out | Query rewritten/cached; response < 300 ms |
| P3 | Cache never hits for anonymous users | Find the module/cookie/header breaking it and fix |
| P4 | Site collapses at 200 concurrent users | Add Memcache/Redis + Varnish rules; survive load test |
| P5 | Cron takes 40 min and blocks the site | Convert to queue/batch, add locking |
| P6 | `cache_*` and `watchdog` tables are 20 GB | Diagnose cause, clean safely, prevent regrowth |

The grader measures real numbers (response time, query count, memory) with a load script in the sandbox. A fix that is faster but breaks functionality fails.

## 17. Environment parity: prod vs preprod, configuration and deployments (new, mandatory)

This is the "it works on preprod but not on prod" track: the most common real-life Drupal 7 pain.

### 17.1 Configuration management in Drupal 7

- What lives where: code (modules, themes), **configuration in the database** (variables, content types, fields, Views, blocks, roles, permissions, menus, text formats), **content**, **files**.
- Tools and patterns: Features + Strongarm + Defaultconfig, `drush features-revert`, `drush fra`, Master module, `hook_update_N` for config changes, `variable_set` migrations, Drush make / Composer-based D7 builds, Git workflow, `settings.php` and `settings.local.php`, `$conf` overrides, environment detection (`$_ENV`, `AH_SITE_ENVIRONMENT`, etc.).
- Features pitfalls: overridden state, component conflicts, dependencies, revert order, features that capture too much, and `drush updb` vs `features-revert` ordering.

### 17.2 Deployment pipeline exercises

1. Write a deployment script: pull code, `drush updb -y`, `drush fra -y`, `drush cc all`, maintenance mode, rollback plan.
2. Build a Git branching and release strategy (feature, develop, release, hotfix) for a D7 project.
3. Create a content-sync strategy (prod DB to preprod with sanitisation: emails, users, API keys, webform data).
4. Handle files and image styles sync (rsync, stage\_file\_proxy).
5. Write a pre-deploy checklist and a post-deploy smoke test.

### 17.3 "Prod is not in sync with preprod" incident library

Each case is an environment with a hidden difference. The student must find the cause using logs, Drush, DB inspection and diff tools, then fix and document it.

| Case | Symptom | Hidden cause |
| --- | --- | --- |
| E1 | A view works on preprod, empty on prod | A Features component was not reverted; the database overrides the code |
| E2 | Permissions differ between environments | Roles/permissions were changed manually on prod and never exported |
| E3 | White screen only on prod | Different PHP version/extensions or `memory_limit` |
| E4 | Emails not sent on prod | SMTP config in `$conf` missing, or preprod used a mail catcher |
| E5 | Images broken after deploy | Files directory/permissions, image style cache not flushed |
| E6 | Updates fail on prod | Missing `hook_update_N`, schema version mismatch in the `system` table |
| E7 | Cron behaves differently | Poormanscron vs system cron, different lock state |
| E8 | Search/Solr returns old data | Different index/server config between environments |
| E9 | Site is slow only on prod | Cache backend differs (Memcache missing), different cache settings |
| E10 | Wrong URLs, SSL redirect loops | `$base_url`, reverse proxy headers, HTTPS detection |
| E11 | Module versions differ | `dev` version on preprod vs stable on prod; no version lock |
| E12 | Deploy broke prod and rollback fails | Non-reversible DB update, no backup, no maintenance mode |

Every case is graded on: root cause identified, fix applied, **prevention measure** written (documentation or automation), and a clear incident report.

### 17.4 Tooling to teach

`drush` (sql-sync, rsync, config/variables, `drush @alias`), `drush site-aliases`, `diff`/`git diff` on DB dumps, `drush php-eval`, `drush ev`, `drush vget/vset`, `drush features-diff`, `drush sql-sanitize`, logs analysis (Apache/Nginx, PHP-FPM, MySQL, watchdog/syslog), CI basics (GitLab CI/GitHub Actions/Jenkins), Docker for local parity.

## 18. Real-world use case and incident library (new)

Beyond the exercises, the platform includes a library of **50+ scenario labs**, each with a brief, a broken or incomplete environment, constraints and a debrief.

- **Production incidents**: hacked site (Drupalgeddon-style exploit and clean-up), spam flood, 500 errors after update, database corruption, disk full, cron stuck, locked admin account, accidentally deleted content type.
- **Client situations**: contradictory requirements, impossible deadline (estimation exercise), request to "just hack core", legacy site with 80 contrib modules and no documentation.
- **Architecture cases**: multisite vs separate sites, multilingual site (i18n, l10n\_update), complex roles and workflow, large imports (Migrate), SSO/LDAP, REST/API services, commerce (Drupal Commerce) basics, search (Solr), headless readiness.
- **Maintenance cases**: security update on a heavily customised site, PHP upgrade for a D7 site, module with abandoned maintainership, upgrade-to-D10 assessment.

Each lab produces a written report that the AI grades (clarity, diagnosis quality, risk assessment, communication).

## 19. Admin panel (new)

Even if the first version has one user, the panel is built as a proper back office with roles (owner, editor, learner) so the platform can later host other learners.

### 19.1 Modules

- **Dashboard**: active learners, completion rates, average scores, failed exercises ranking, token and sandbox usage, errors, system health.
- **Curriculum manager**: CRUD for tracks, levels, days, lessons, skills and prerequisites with drag-and-drop ordering, version history and publish/draft states.
- **Exercise studio**: create and edit exercises (spec, starter code, hidden tests, rubric, hints, solution), run the validator (solution must pass), preview as a learner, duplicate with AI-generated variants, tag and difficulty calibration.
- **Scenario/lab builder**: define a sandbox snapshot (Docker image, SQL dump, files), inject faults, attach grading scripts.
- **AI control centre**: provider keys and failover order, model per agent, prompt templates with versioning and A/B testing, usage and cost graphs, rate-limit status, test console, log of every AI call (input, output, latency).
- **Learner management**: profile, progress, skill map, attempt history, manual grade override with justification, reset or unlock a level, notes.
- **Grading rules**: weights, pass marks, strictness presets, security rule list (patterns), PHPCS rule set.
- **Sandbox operations**: running containers, image catalogue, resource limits, logs, kill and clean, health checks.
- **Content quality**: reports of exercises with unusually low success, user-flagged wrong answers, hallucination reports, automatic CI validation status.
- **Certification manager**: exam definitions, question banks, certificates issued, verification codes, revocation.
- **System**: feature flags, backups and restore, audit log, import/export of content packs, email templates, settings.

### 19.2 Requirements

- Role-based access control, audit trail of all changes, content in Git-exportable format, bulk actions, search and filters everywhere, and the same animated, responsive design as the learner app.

## 20. Multi-version, multi-platform architecture (future-proofing)

Design now so that adding other Drupal learning tracks later does not require a rewrite.

- **Track** entity: `drupal7`, `drupal8-9`, `drupal10-11`, `backdrop`, `acquia-platform`, `pantheon-platform`, `drupal-devops`, and so on. Each track has its own curriculum, sandbox images, grading plugins, and RAG index.
- **Shared skill taxonomy**: version-independent skills (caching, security, config management, testing, deployment) mapped to version-specific implementations, so progress can be reused when moving between tracks.
- **Sandbox image catalogue** per version (PHP, DB, Drush/Composer versions); grading plugins per version (PHPCS Drupal standard, PHPUnit, SimpleTest, Twig linting).
- **Version-aware AI**: system prompts, validators and RAG are selected by track so the mentor never mixes D7 and D10 syntax.
- **Migration track**: D7 to D10/11 lessons and labs (Migrate API, content audit, module replacement mapping), the natural bridge between tracks.
- **Content packs**: curriculum shipped as versioned packs, importable and exportable via the admin panel.

## 21. Certification and credentials (new)

### 21.1 Reality check on Acquia

Acquia's current Drupal exams target **Drupal 10/11** (Site Builder, Developer, Front End Specialist, Back End Specialist), and Acquia retires exams when a Drupal version reaches end of life (for example Drupal 9 exams were retired in November 2023). I could not find a current Drupal 7 exam in Acquia's program, so **this platform cannot make you officially Acquia-certified on Drupal 7**, and the official exams are taken through Acquia Academy with an online proctor, not inside this SaaS. Please verify the exam list on Acquia's site before planning, as it can change.

### 21.2 What the platform will do instead

1. **Own certification**: "Drupal 7 Certified Professional" (internal, with levels: Site Builder, Developer, Front End, Back End, Performance & Operations, plus an overall Expert badge). Issued after the capstone, with a unique verification code and a public verification page (optional), a PDF certificate, and a detailed skills report.
2. **Acquia-aligned exam prep track**: practice exams modelled on the public Acquia exam blueprints and study guides (domains, weights, question styles: multiple choice and multiple response, timed, scored, with explanations). Because the real exams cover Drupal 10/11, this track includes a **D7 to D10/11 bridge** so concepts learned here transfer.
3. **Triple-certified path**: the Developer / Front End / Back End structure is mirrored in the platform so the same competency areas can be re-trained on the Drupal 10/11 track once added.
4. **Exam simulator**: timed, no hints, randomised question banks, readiness score per domain, and a recommendation of when you are ready to book the real exam.
5. **Portfolio**: finished labs and projects exported as proof of work, which employers often value as much as a certificate.

### 21.3 Internal certification rules

- Prerequisites: all Level Gates passed, no unresolved critical-security failures.
- Exam: 4-hour practical (build, debug, secure, optimise, deploy) plus a 90-minute theory test; pass mark 85%.
- Anti-cheating: randomised variants, hidden tests, code-similarity detection, session recording of activity (keystroke timeline), time limits.
- Validity: certificate carries the Drupal 7 version, platform version and date; re-certification prompts on curriculum updates.

## 22. Updated curriculum structure: Core 30 days + Mastery Phase

| Phase | Duration | Content |
| --- | --- | --- |
| Core Programme | Days 1 to 30 | Levels 0 to 5 as in section 4, with the performance track (16) and environment/deployment track (17) integrated into Level 4 and the Day 28 to 30 capstone |
| Mastery Phase | Weeks 5 to 12 | Incident library (18), 2 real-world projects, performance and security audits, migration project, exam simulator |
| Bridge Phase (optional) | Weeks 13 to 16 | Drupal 10/11 bridge and Acquia-aligned exam prep |

Integration changes to the Level 4 days (22 to 27):

- Day 22: Security I (unchanged).
- Day 23: Security II plus incident response (hacked-site lab).
- Day 24: Performance I – caching layers and database tuning (labs P1 to P3).
- Day 25: Performance II – back ends, load testing, cron/queues (labs P4 to P6).
- Day 26: Configuration management, Features, deployment pipeline and environment parity (cases E1 to E12, first half).
- Day 27: Level 4 Gate: audit, fix and redeploy a de-synchronised prod/preprod pair, with a written incident report.

Days 28 to 30 remain migration, interview prep and the capstone, with the capstone now including a deployment and a performance requirement.

## 23. Updated roadmap and risks

| Phase | Duration | Content |
| --- | --- | --- |
| 0. Setup | 2 days | Repo, D7 Docker image, LLM gateway |
| 1. MVP | 2 weeks | Chat mentor, 10 days of content, sandbox, grading, basic admin (exercise studio) |
| 2. Core | 3 weeks | Full 30 days, performance and environment-parity labs, strict grading pipeline, spaced repetition |
| 3. Admin and polish | 2 weeks | Full admin panel, AI control centre, animations, gamification, RAG |
| 4. Certification | 1 week | Internal certificate, exam simulator, portfolio export |
| 5. Multi-track | Later | Track abstraction in production, Drupal 10/11 track, Acquia-aligned prep |

New risks:

- Building two-environment (prod/preprod) sandboxes is heavy: mitigate with Docker Compose templates and pre-built snapshots per scenario.
- Load-test results vary by machine: grade relative improvement (before/after ratio) and query counts, not absolute milliseconds only.
- Acquia exam content is proprietary: use only public blueprints and study guides, write original questions, never reproduce real exam items.
- Scope growth: ship Core first, keep the multi-track abstraction in the data model but add other tracks only after the D7 track is solid.

## 24. New acceptance criteria

- At least 6 performance labs and 12 environment-parity cases run end to end with automatic grading.
- The admin panel can create a new exercise, validate it, publish it, and see its success statistics without code changes.
- A learner can complete the internal certification and receive a verifiable certificate and skills report.
- The data model supports multiple tracks and versions without schema change.
- The exam simulator produces a per-domain readiness score.
