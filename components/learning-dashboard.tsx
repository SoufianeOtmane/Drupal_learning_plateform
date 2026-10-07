"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppSidebar, { learningDays } from "@/components/app-sidebar";
import ChatMessageContent from "@/components/chat-message-content";
import DayCurriculum from "@/components/day-curriculum";
import PlacementAssessment from "@/components/placement-assessment";
import { useLearnerState } from "@/hooks/use-learner-state";
import { useMentorChat } from "@/hooks/use-mentor-chat";
import { readApiResponse } from "@/lib/read-api-response";
import type { PlacementSkill, PlacementSkillResult } from "@/lib/learner-types";
import {
  AlarmClock,
  ArrowRight,
  Check,
  CheckCircle2,
  Bot,
  CircleHelp,
  Code2,
  Flame,
  FlaskConical,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Command,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

type ChatMessage = {
  role: "mentor" | "you";
  text: string;
};

const webRequestOptions = [
  { id: "wrong-order", text: "The server sends a page, then the browser requests its data." },
  { id: "right-order", text: "The browser requests a page, the server runs PHP, then returns HTML." },
  { id: "static-only", text: "The browser reads PHP files directly from the server." },
];

const lessonDetails: Record<
  number,
  {
    title: string;
    topic: string;
    minutes: number;
    hints: [string, string, string];
    testQuestion: string;
    firstStep: string;
  }
> = {
  1: {
    title: "Web request basics",
    topic: "How a browser request reaches a server and becomes a page",
    minutes: 30,
    hints: [
      "Start with what you already know: PHP, HTML/CSS, SQL, Git, or the terminal.",
      "You do not need to write a Drupal module yet. We will check one prerequisite at a time.",
      "Pick one unfamiliar term and I will explain it with a small example before asking you to try anything.",
    ],
    testQuestion: "Which happens first: the browser requests the page, or the server sends it?",
    firstStep: "A browser requests a page; the server processes it and sends a response back.",
  },
  2: {
    title: "PHP building blocks",
    topic: "Variables, values, conditions, and arrays",
    minutes: 25,
    hints: [
      "PHP variable names begin with a dollar sign.",
      "A single equals sign assigns a value; two equals signs compare values.",
      "Indexed arrays start with index 0.",
    ],
    testQuestion: "How does PHP mark a variable name?",
    firstStep: "Try reading a simple variable assignment before changing the example.",
  },
  3: {
    title: "HTML forms and safe output",
    topic: "Collect input, validate it, and escape output",
    minutes: 30,
    hints: [
      "A form control needs a name so submitted data can be identified.",
      "Browser-side checks help users, but the server must validate submitted values.",
      "In Drupal 7, check_plain() escapes plain text for HTML output.",
    ],
    testQuestion: "Why does server-side code still validate a form submission?",
    firstStep: "Follow one submitted field from the browser to server-side validation.",
  },
  4: {
    title: "SQL and safe data access",
    topic: "Tables, queries, filtering, and parameterized values",
    minutes: 30,
    hints: [
      "SELECT reads columns from a table.",
      "WHERE narrows which rows match.",
      "Use placeholders with Drupal 7 db_query(); never concatenate untrusted values into SQL.",
    ],
    testQuestion: "What keeps user input from becoming part of a SQL statement?",
    firstStep: "Write the query shape first, then identify the value that belongs in a placeholder.",
  },
  8: {
    title: "Module anatomy",
    topic: "The files that make Drupal modules work",
    minutes: 18,
    hints: [
      "Hint 1/3: Drupal 7 needs an .info file before it can discover a module.",
      "Hint 2/3: The .module file is optional for a module with no hooks, but it is where hook implementations live.",
      "Hint 3/3: Start by naming the module in its .info file, then add a .module file for your hook implementation.",
    ],
    testQuestion: "Quick check: which file tells Drupal 7 a module exists, and which file contains its hooks?",
    firstStep: "List the files Drupal needs to discover your module, then tell me what belongs in each.",
  },
  9: {
    title: "The menu system",
    topic: "Routes, callbacks, and access control",
    minutes: 24,
    hints: [
      "Hint 1/3: hook_menu() returns an array keyed by the path you want Drupal to register.",
      "Hint 2/3: Put the permission name in the route item's 'access arguments' and use 'user_access' as the callback.",
      "Hint 3/3: Try 'access callback' => 'user_access' and 'access arguments' => array('administer content').",
    ],
    testQuestion: "Quick check: what must Drupal 7 verify before invoking a page callback? Answer with the API callback name.",
    firstStep: "Show me your first attempt at a hook_menu() item. I’ll check the access callback and permission.",
  },
  10: {
    title: "Form API",
    topic: "Build secure, validated Drupal forms",
    minutes: 32,
    hints: [
      "Hint 1/3: A Drupal 7 form definition is a nested render array returned by a form builder.",
      "Hint 2/3: Keep validation separate from submit handling; Form API validates before it calls the submit handler.",
      "Hint 3/3: Use #validate for validation handlers and #submit for the handler that saves the accepted value.",
    ],
    testQuestion: "Quick check: which Form API property attaches a validation handler?",
    firstStep: "Sketch the form array and identify which callback validates the submitted value.",
  },
  11: {
    title: "Database API",
    topic: "Query safely with Drupal's database layer",
    minutes: 28,
    hints: [
      "Hint 1/3: Drupal 7 provides db_query() for parameterized queries.",
      "Hint 2/3: Keep user-provided values out of the SQL string; pass them through placeholders.",
      "Hint 3/3: Use db_query('SELECT ... WHERE uid = :uid', array(':uid' => $uid)) for a bound value.",
    ],
    testQuestion: "Quick check: what prevents a user-supplied value from becoming part of the SQL syntax?",
    firstStep: "Write the query shape and show how you bind the value instead of concatenating it.",
  },
  12: {
    title: "Render API",
    topic: "Turn structured data into cacheable output",
    minutes: 25,
    hints: [
      "Hint 1/3: Drupal 7 render arrays describe output before it is rendered.",
      "Hint 2/3: Put markup in a render array instead of concatenating a page's HTML string.",
      "Hint 3/3: Return a render array with '#theme' or '#markup' and attach cache metadata with '#cache'.",
    ],
    testQuestion: "Quick check: what kind of structure should a Drupal 7 page callback return for themed output?",
    firstStep: "Show me the render array you would return and explain how Drupal themes it.",
  },
  13: {
    title: "Entity & fields",
    topic: "Model content beyond the node",
    minutes: 30,
    hints: [
      "Hint 1/3: Drupal 7's Entity API treats nodes, users, and other records as entities.",
      "Hint 2/3: Field API separates field storage from the bundles that use each field.",
      "Hint 3/3: Identify the entity type and bundle before choosing where to attach a field.",
    ],
    testQuestion: "Quick check: what does a bundle represent in Drupal 7's Entity/Field API?",
    firstStep: "Name the entity type and bundle for the content you want to model.",
  },
  14: {
    title: "Blocks & cron",
    topic: "Build reusable components and background work",
    minutes: 22,
    hints: [
      "Hint 1/3: hook_block_info() declares the blocks a module provides.",
      "Hint 2/3: hook_block_view() builds the render array for a specific block delta.",
      "Hint 3/3: For long-running scheduled work, enqueue small tasks and process them incrementally.",
    ],
    testQuestion: "Quick check: which hook declares the blocks provided by a Drupal 7 module?",
    firstStep: "Start with the hook that declares your block, then describe what its view callback returns.",
  },
};

const initialMessages: ChatMessage[] = [
  {
    role: "mentor",
    text: "I’m here to help you understand the current lesson. Ask a question or request a simple example whenever you need one.",
  },
];

function SkillBars({
  scores,
}: {
  scores: Partial<Record<PlacementSkill, PlacementSkillResult>> | undefined;
}) {
  const skills = scores;
  if (skills) {
    return (
      <div className="placement-mini-skills">
        {Object.entries(skills).map(([skill, result]) => (
          <span key={skill}>{skill.replace("_", " ")} <strong>{result?.score}%</strong></span>
        ))}
      </div>
    );
  }
  return (
    <p className="summary-note">Complete the starting-point assessment to see evidence-based skill scores.</p>
  );
}

export default function LearningDashboard() {
  const learner = useLearnerState();
  const [activeDay, setActiveDay] = useState(1);
  const [draft, setDraft] = useState("");
  const [selectedRequestAnswer, setSelectedRequestAnswer] = useState("");
  const [requestAnswerResult, setRequestAnswerResult] = useState<"correct" | "retry" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [notice, setNotice] = useState("");
  const mentor = useMentorChat(initialMessages);
  const detail = lessonDetails[activeDay] ?? lessonDetails[1];
  const lessonFinished = learner.state?.lesson.status === "completed";
  const placementComplete = Boolean(learner.state?.placement);
  const handlePlacementComplete = useCallback(() => {
    void learner.refresh();
  }, [learner.refresh]);
  const exerciseContext = activeDay === 1
    ? `The learner is in the Day 1 web-request lesson's ${lessonFinished ? "finished" : "open Q&A"} phase. Answer their question directly in plain language. Do not turn ordinary questions into quizzes or ask follow-up questions by default. The separate practice check is controlled by the app, is ungraded, and does not change progress. ${lessonFinished ? "The learner has finished the lesson; answer only what they ask and do not restart or extend the lesson." : "The learner can choose when to try the separate practice check or finish."}`
    : `The learner is studying Day ${activeDay}: ${detail.title} (${detail.topic}). Be a patient mentor speaking to a junior developer: answer the question directly in plain language and use a small example when useful. Do not turn ordinary questions into quizzes or ask follow-up questions by default. Lessons and checkpoint grading are managed by the app; do not claim to record completion, grade answers, or unlock days.`;

  useEffect(() => {
    if (!focusMode) return;
    function leaveFocusMode(event: KeyboardEvent) {
      if (event.key === "Escape") setFocusMode(false);
    }
    window.addEventListener("keydown", leaveFocusMode);
    return () => window.removeEventListener("keydown", leaveFocusMode);
  }, [focusMode]);

  useEffect(() => {
    if (!learner.loading && learner.state && activeDay === 1 && learner.state.currentDay > 1) {
      setActiveDay(Math.min(learner.state.currentDay, 4));
    }
  }, [activeDay, learner.loading, learner.state?.currentDay]);

  useEffect(() => {
    const lesson = learner.state?.lesson;
    if (!lesson) return;
    setSelectedRequestAnswer(lesson.practiceAnswer ?? "");
    setRequestAnswerResult(
      lesson.practiceCorrect === null
        ? null
        : lesson.practiceCorrect
          ? "correct"
          : "retry",
    );
  }, [learner.state?.lesson]);

  useEffect(() => {
    if (!placementComplete || learner.state?.lesson.status !== "not_started") return;
    void saveLessonAction({ action: "start" }).then((error) => {
      if (error) {
        setNotice(error);
        return;
      }
      void learner.refresh();
    });
  }, [learner.state?.lesson.status, learner.refresh, placementComplete]);

  function sendMessage(text: string) {
    const cleanText = text.trim();
    if (!cleanText) return;
    void mentor.sendMessage(cleanText, exerciseContext);
    setDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  async function checkWebRequestAnswer() {
    if (!selectedRequestAnswer) {
      setNotice("Choose the sequence you think is correct, then check your answer.");
      return;
    }
    const correct = selectedRequestAnswer === "right-order";
    const error = await saveLessonAction({ action: "practice", answer: selectedRequestAnswer });
    if (error) {
      setNotice(error);
      return;
    }
    setRequestAnswerResult(correct ? "correct" : "retry");
    setNotice(
      correct
        ? "Correct. You can finish this mini-lesson now; this practice check is not a grade."
        : "Not quite. Remember: the browser asks first; the server does the PHP work.",
    );
  }

  async function finishLesson() {
    const error = await saveLessonAction({ action: "finish" });
    if (error) {
      setNotice(error);
      return;
    }
    setNotice("Mini-lesson completion saved. The practice check is not graded and no next level is unlocked yet.");
    void learner.refresh();
  }

  async function saveLessonAction(body: Record<string, string>) {
    try {
      const response = await fetch("/api/lesson/day-1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await readApiResponse<{ started?: boolean; answer?: string; correct?: boolean; completed?: boolean }>(response);
      return "";
    } catch (caught) {
      return caught instanceof Error ? caught.message : "Could not save lesson progress.";
    }
  }

  function selectDay(day: number) {
    if (day > (learner.state?.currentDay ?? 1)) {
      setNotice(`Day ${day} is locked. Pass the previous day's checkpoint with at least 85% to unlock it.`);
      return;
    }
    setActiveDay(day);
    setSelectedRequestAnswer("");
    setRequestAnswerResult(null);
    mentor.resetMessages([{
      role: "mentor",
      text: `${lessonDetails[day].topic}. Ask me about anything unclear, then choose if and when to try the separate practice check.`,
    }]);
    setNotice(`Day ${day} selected — your workspace is ready.`);
  }

  function continueToDay(day: number) {
    if (day < 1 || day > 4) return;
    setActiveDay(day);
    setSelectedRequestAnswer("");
    setRequestAnswerResult(null);
    mentor.resetMessages([{
      role: "mentor",
      text: `${lessonDetails[day].topic}. Ask me about anything unclear, and I’ll explain it with a small example when useful.`,
    }]);
    setNotice(`Day ${day} unlocked — your workspace is ready.`);
    void learner.refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className={`app-shell ${focusMode ? "focus-active" : ""}`}>
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeDay={activeDay}
        onDaySelect={selectDay}
        learnerState={learner.state}
      />

      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="icon-button menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <span>Learning path</span><span className="crumb-slash">/</span>                        <span className="crumb-current">{detail.title}</span>
          </div>
          <div className="topbar-actions">
            {focusMode && (
              <button className="focus-exit" onClick={() => setFocusMode(false)}>
                Exit focus <kbd>Esc</kbd>
              </button>
            )}
            <div className="streak-pill"><Flame size={15} fill="currentColor" /><span>—</span></div>
            <button className="search-button" onClick={() => setNotice("Search and command palette are coming soon.")}>
              <Search size={15} /><span>Search anything</span><kbd><Command size={11} /> K</kbd>
            </button>
            <button className="icon-button help-button" aria-label="Help"><CircleHelp size={18} /></button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date())} <span className="eyebrow-separator">/</span> DAY {String(activeDay).padStart(2, "0")} OF 30</div>
              <h1>{activeDay === 1 ? "Start with your foundations." : detail.title}</h1>
              <p className="welcome-subtitle">{activeDay === 1 ? "A short explanation, optional practice, and a clear stopping point. No code required." : `${detail.topic}. Complete each short lesson, then pass the checkpoint to continue.`}</p>
            </div>
            <button
              className="focus-button"
              onClick={() => setFocusMode((current) => !current)}
              aria-pressed={focusMode}
            >
              <Zap size={15} /> {focusMode ? "Exit focus" : "Focus mode"}
            </button>
          </div>

          {notice && (
            <div className="notice-banner" role="status">
              <Sparkles size={15} /> {notice}
              <button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={14} /></button>
            </div>
          )}

          {learner.loading && activeDay === 1 && (
            <section className="placement-panel" aria-live="polite">Loading your saved learner record…</section>
          )}
          {!learner.loading && learner.error && (
            <div className="placement-error" role="alert">
              {learner.error} Start PostgreSQL and apply the database migrations to load saved progress.
            </div>
          )}
          {!learner.loading && !learner.error && activeDay === 1 && (
            <PlacementAssessment onComplete={handlePlacementComplete} />
          )}

          {activeDay === 1 && <section className="summary-grid strict-scorecard" aria-label="Strict progress scorecard">
            <article className="summary-card">
              <span className="card-overline">DAY 1 CHECKPOINT</span>
              <strong className="summary-number">{learner.state?.completedDays[1] ? `${learner.state.completedDays[1].score}%` : "—"}</strong>
              <span className="summary-note">{learner.state?.completedDays[1] ? "Passed · Day 2 unlocked" : "85% required to unlock Day 2"}</span>
            </article>
            <article className="summary-card">
              <span className="card-overline">PLACEMENT SCORE</span>
              <strong className="summary-number">{learner.state?.placement ? `${learner.state.placement.overallScore}%` : "Not assessed"}</strong>
              <span className="summary-note">Placement snapshot · not mastery</span>
            </article>
            <article className="summary-card">
              <span className="card-overline">LESSON PROGRESS</span>
              <strong className="summary-number">
                {lessonFinished
                  ? "Complete"
                  : learner.state?.lesson.status === "in_progress"
                    ? "In progress"
                    : "Not started"}
              </strong>
              <span className="summary-note">
                {lessonFinished
                  ? "Completion saved"
                  : learner.state?.lesson.status === "in_progress"
                    ? "Day 1 lesson"
                    : placementComplete
                      ? "Ready to begin"
                      : "Available after placement"}
              </span>
            </article>
            <article className="summary-card gate-summary">
              <span className="card-overline">STARTING LEVEL</span>
              <strong className="summary-number">{learner.state?.placement ? `Level ${learner.state.placement.recommendedLevel}` : "Pending"}</strong>
              <span className="summary-note">{learner.state?.placement?.recommendedLevelTitle ?? "Determined after placement"}</span>
            </article>
          </section>}

          {!placementComplete && (
            <div className="placement-gate-note">
              Complete the placement check above to see your Day 1 lesson and its saved progress.
            </div>
          )}
          {placementComplete && (
          <div className="content-grid">
            <div className="lesson-column">
              {activeDay === 1 ? (
                <>
              <section className="mission-card">
                <div className="mission-topline">
                  <div className="mission-tag"><span /> DAY {activeDay} <span className="tag-divider">/</span> FOUNDATIONS</div>
                  <button className="text-icon" aria-label="More mission options"><MoreHorizontal size={19} /></button>
                </div>
                <div className="mission-main">
                  <div className="mission-copy">
                    <h2>How a web request becomes a page</h2>
                    <p>When you open a page, the browser asks a server for it. Drupal runs on that server and builds the response.</p>
                    <ol className="lesson-flow-steps">
                      <li><strong>Browser</strong><span>Sends a request for a URL.</span></li>
                      <li><strong>Server</strong><span>Runs PHP and Drupal; it may read from the database.</span></li>
                      <li><strong>Browser</strong><span>Receives HTML and displays the page.</span></li>
                    </ol>
                    <div className="mission-meta">
                      <span><AlarmClock size={14} /> 5 min</span><i />
                      <span><FlaskConical size={14} /> One practice check</span><i />
                      <span><ShieldCheck size={14} /> Not graded</span>
                    </div>
                    <div className="mission-gate"><LockKeyhole size={14} /><span>Read, ask questions, practise if ready, then finish. No pressure to write code.</span></div>
                  </div>
                  <div className="lesson-practice-card">
                    <div className="lesson-practice-top">
                      <div><span className="section-kicker">OPTIONAL PRACTICE · NOT A GRADE</span><h3>Choose the right sequence</h3></div>
                      {requestAnswerResult === "correct" && <CheckCircle2 size={19} aria-label="Correct answer" />}
                    </div>
                    <p>Which statement best describes a basic PHP page request?</p>
                    <div className="lesson-answer-options" role="radiogroup" aria-label="Choose the page request sequence">
                      {webRequestOptions.map((option) => (
                        <label
                          className={`lesson-answer-option ${selectedRequestAnswer === option.id ? "selected" : ""}`}
                          key={option.id}
                        >
                          <input
                            type="radio"
                            name="web-request-sequence"
                            value={option.id}
                            checked={selectedRequestAnswer === option.id}
                            onChange={() => {
                              setSelectedRequestAnswer(option.id);
                              setRequestAnswerResult(null);
                            }}
                          />
                          <span className="lesson-answer-marker" aria-hidden="true" />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                    {requestAnswerResult === "correct" && (
                      <p className="lesson-answer-feedback correct">That’s right: the browser requests; the server runs PHP and returns HTML.</p>
                    )}
                    {requestAnswerResult === "retry" && (
                      <p className="lesson-answer-feedback">Try again, or ask the mentor to explain the sequence. This is practice only.</p>
                    )}
                    <div className="lesson-practice-actions">
                      <button className="primary-button" onClick={() => void checkWebRequestAnswer()} disabled={requestAnswerResult === "correct"}>
                        <Check size={14} /> Check answer
                      </button>
                      <button className="lesson-finish-button" onClick={finishLesson} disabled={lessonFinished}>
                        {lessonFinished ? "Finished" : "Finish lesson"}
                      </button>
                    </div>
                    {lessonFinished && <p className="lesson-finished-note" role="status">You finished this mini-lesson. Completion is saved; no grade or next-level unlock is recorded.</p>}
                  </div>
                </div>
                <div className="mission-footer">
                  <div className="footer-progress"><span>LESSON FLOW</span><strong>Read → ask freely → optional practice → finish when ready.</strong></div>
                  <Link className="footer-link" href="/guide">How progression works <ArrowRight size={14} /></Link>
                </div>
              </section>
              <DayCurriculum
                day={1}
                onContinue={continueToDay}
                onProgress={() => void learner.refresh()}
              />

              <section className="section-block">
                <div className="section-heading">
                  <div><h2>Learning route</h2><span className="map-subtitle">Days 1–4 · later curriculum is coming next</span></div>
                  <Link className="subtle-link" href="/skills">Readiness details <ArrowRight size={14} /></Link>
                </div>
                <div className="curriculum-card">
                  <div className="curriculum-top">
                    <div className="curriculum-level-icon"><Code2 size={17} /></div>
                    <div className="curriculum-title"><span>LEVEL 00 <b>·</b> DAY 01</span><strong>Foundations intro</strong></div>
                    <div className="level-progress"><span>85% checkpoint required to advance</span><div className="level-track"><i /></div></div>
                    <button className="icon-button card-menu" aria-label="Curriculum options"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="curriculum-days">
                    {learningDays.map((lesson, index) => {
                      const completed = Boolean(learner.state?.completedDays[lesson.day]);
                      const locked = lesson.day > (learner.state?.currentDay ?? 1);
                      const state = completed ? "done" : locked ? "locked" : "current";
                      return (
                      <button
                        key={lesson.day}
                        className={`curriculum-day ${state} ${activeDay === lesson.day ? "selected" : ""}`}
                        onClick={() => selectDay(lesson.day)}
                        disabled={locked}
                        aria-label={`Day ${lesson.day}: ${lesson.title}`}
                      >
                        <span className="curriculum-node">{completed ? <Check size={13} /> : locked ? <LockKeyhole size={12} /> : lesson.day}</span>
                        <span className="curriculum-day-label">DAY {lesson.day}</span>
                        <span className="curriculum-day-name">{lesson.title}</span>
                        {index < learningDays.length - 1 && <span className="node-line" />}
                      </button>
                    )})}
                    <button className="curriculum-more" onClick={() => setNotice("Days 5–30 have not been written yet.")}><ArrowRight size={16} /><span>More days<br />coming soon</span></button>
                  </div>
                </div>
              </section>

              <div className="lower-grid">
                <section className="panel-card skills-card">
                  <div className="panel-heading"><div><span className="section-kicker">PLACEMENT</span><h3>Skill snapshot</h3></div><button className="text-icon" aria-label="Skill profile options"><MoreHorizontal size={18} /></button></div>
                  <SkillBars scores={learner.state?.placement?.skills} />
                  <Link className="subtle-link skill-link" href="/skills">View skill profile <ArrowRight size={13} /></Link>
                </section>
                <section className="panel-card achievement-card">
                  <div className="panel-heading"><div><span className="section-kicker">REVIEW QUEUE</span><h3>No reviews scheduled</h3></div><span className="review-count">NOT TRACKED</span></div>
                  <p className="summary-note">Reviews will be scheduled after assessed answers reveal what needs practice.</p>
                  <Link className="subtle-link" href="/guide">How progress works <ArrowRight size={13} /></Link>
                </section>
              </div>
                </>
              ) : (
                <DayCurriculum
                  day={activeDay}
                  onContinue={continueToDay}
                  onProgress={() => void learner.refresh()}
                />
              )}
            </div>

            <aside className="mentor-panel" aria-label="Mentor and lesson progress">
              <div className="mentor-header">
                <div className="mentor-heading">
                  <div className="mentor-avatar"><Bot size={18} /><span /></div>
                  <div><strong>Your mentor</strong><span><i /> Learning mode · Online</span></div>
                </div>
                <button className="text-icon" aria-label="Mentor options"><MoreHorizontal size={19} /></button>
              </div>
              <div className="mentor-rule"><ShieldCheck size={14} /><span>Ask freely. Chat is for learning; practice is separate and ungraded.</span></div>
              <div className="chat-context"><span>DAY {activeDay} · {detail.title.toUpperCase()}</span><span className="context-live"><i /> LIVE</span></div>
              <div className="chat-messages" aria-live="polite">
                {mentor.messages.slice(-5).map((message, index) => (
                  <div className={`chat-message ${message.role}`} key={`${message.role}-${index}-${message.text.slice(0, 12)}`}>
                    {message.role === "mentor" && <div className="message-avatar"><Bot size={14} /></div>}
                    <div className="message-bubble">
                      {message.role === "mentor" ? <ChatMessageContent text={message.text} /> : <span>{message.text}</span>}
                    </div>
                  </div>
                ))}
                {mentor.isSending && <div className="mentor-typing" role="status">Mentor is reviewing your message…</div>}
              </div>
              {mentor.error && <div className="chat-error" role="alert">{mentor.error}</div>}
              <div className="quick-actions">
                {[
                  { label: "Explain again", icon: MessageSquareText },
                  { label: "Give an example", icon: Code2 },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className="quick-action" onClick={() => sendMessage(label === "Explain again" ? "Explain the lesson more simply, without asking me a quiz question." : "Give me one small example of the lesson, with a short explanation.")}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
              <form className="chat-composer" onSubmit={handleSubmit}>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={mentor.isSending ? "Mentor is responding..." : "Ask your mentor anything..."}
                  aria-label="Message your mentor"
                  disabled={mentor.isSending}
                />
                <div className="composer-bottom">
                  <span><span className="composer-status" /> Beginner-friendly · Day {activeDay}</span>
                  <button className="send-button" type="submit" aria-label="Send message" disabled={!draft.trim() || mentor.isSending}><Send size={15} /></button>
                </div>
              </form>
              <div className="mentor-footnote"><LockKeyhole size={12} /> Chat does not record assessment results or unlock lessons.</div>

              {activeDay === 1 && <div className="today-progress">
                <div className="today-progress-head"><strong>Today’s checklist</strong><button className="text-icon" aria-label="Checklist options"><MoreHorizontal size={16} /></button></div>
                <div className="checklist-item"><span className={lessonFinished ? "check-done" : "check-empty"} /><div><strong>Read the web-request lesson</strong><small>{lessonFinished ? "Completed · saved" : "In progress · 5 min"}</small></div><ArrowRight size={14} /></div>
                <div className="checklist-item"><span className={learner.state?.lesson.practiceAnswer ? "check-done" : "check-empty"} /><div><strong>Try the sequence practice</strong><small>{learner.state?.lesson.practiceAnswer ? "Attempt saved · not graded" : "Optional · not graded"}</small></div><ArrowRight size={14} /></div>
                <div className="checklist-item"><span className={placementComplete ? "check-done" : "check-empty"} /><div><strong>{placementComplete ? "Placement assessment" : "Take the placement assessment"}</strong><small>{placementComplete ? "Complete · results saved" : "20-question check"}</small></div>{placementComplete ? <Check size={14} /> : <LockKeyhole size={14} />}</div>
                <button className="checklist-link" onClick={() => setNotice("Placement, lesson completion, checkpoint answers, scores, and day unlocks are saved in PostgreSQL. Mentor chat history is not saved.")}>Progress tracking status <ArrowRight size={13} /></button>
              </div>}
            </aside>
          </div>
          )}
          <footer className="page-footer"><span>Placement, lessons, checkpoint scores, and day unlocks are saved. Mentor chat is not persisted.</span><span>DRUPAL 7 TRACK <b>·</b> DAY {String(activeDay).padStart(2, "0")}</span></footer>
        </div>
      </section>
    </main>
  );
}
