"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AppSidebar, { learningDays } from "@/components/app-sidebar";
import { useMentorChat } from "@/hooks/use-mentor-chat";
import {
  AlarmClock,
  ArrowRight,
  Bot,
  Check,
  CheckCheck,
  CircleHelp,
  Code2,
  Flame,
  FlaskConical,
  Lightbulb,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
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

const hintCosts = [3, 6, 10] as const;

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
    text: "You passed the module anatomy check. Today, build a menu callback that only editors can access. Start with the access callback, not the page output.",
  },
  {
    role: "you",
    text: "Why does Drupal 7 use hook_menu() for page routes?",
  },
  {
    role: "mentor",
    text: "Because Drupal 7's menu router is also its route and access registry. hook_menu() declares the path, callback, and permission check together. In Drupal 7, do not reach for routes.yml — that is a later-version pattern.",
  },
];

function SkillBars() {
  const skills = [
    { name: "Module dev", value: 34, color: "violet" },
    { name: "Theming", value: 18, color: "blue" },
    { name: "Site building", value: 76, color: "mint" },
    { name: "Security", value: 52, color: "amber" },
  ];

  return (
    <div className="skill-list">
      {skills.map((skill) => (
        <div className="skill-row" key={skill.name}>
          <div className="skill-label">
            <span>{skill.name}</span>
            <span>{skill.value}%</span>
          </div>
          <div className="skill-track">
            <span className={`skill-fill ${skill.color}`} style={{ width: `${skill.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LearningDashboard() {
  const [activeDay, setActiveDay] = useState(9);
  const [draft, setDraft] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [attemptCode, setAttemptCode] = useState(
    "function d7_mentor_menu() {\n  return array(\n    'admin/reports/mentor' => array(\n      'title' => 'Mentor report',\n      'page callback' => 'd7_mentor_report',\n      // Add the access callback and permission.\n    ),\n  );\n}",
  );
  const [attemptSaved, setAttemptSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const mentor = useMentorChat(initialMessages);
  const detail = lessonDetails[activeDay];
  const hintPenalty = hintCosts.slice(0, hintCount).reduce((total, cost) => total + cost, 0);

  useEffect(() => {
    if (!focusMode) return;
    function leaveFocusMode(event: KeyboardEvent) {
      if (event.key === "Escape") setFocusMode(false);
    }
    window.addEventListener("keydown", leaveFocusMode);
    return () => window.removeEventListener("keydown", leaveFocusMode);
  }, [focusMode]);

  function sendMessage(text: string) {
    const cleanText = text.trim();
    if (!cleanText) return;
    if (cleanText.toLowerCase().includes("hint")) {
      if (hintCount >= 3) {
        setNotice("All 3 hints used. Make an attempt before requesting more help.");
        return;
      }
      const nextHint = hintCount + 1;
      const nextCost = hintCosts[nextHint - 1];
      const totalPenalty = hintCosts.slice(0, nextHint).reduce((total, cost) => total + cost, 0);
      setHintCount(nextHint);
      void mentor.sendMessage(
        `${cleanText}. Give progressive hint ${nextHint} of 3 only; state that it costs ${nextCost} points and the total hint penalty is ${totalPenalty} points. Do not reveal the full solution.`,
        `Current Drupal 7 exercise: ${detail.title}. Objective: ${detail.topic}. Required score: 80/100. The next level gate requires 85%.`,
      );
    } else {
      void mentor.sendMessage(
        cleanText,
        `Current Drupal 7 exercise: ${detail.title}. Objective: ${detail.topic}. Required score: 80/100. The next level gate requires 85%.`,
      );
    }
    setDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  function handleQuickAction(action: string) {
    if (action === "Hint" && hintCount >= 3) {
      setNotice("All 3 hints used. Make an attempt before requesting more help.");
      return;
    }
    sendMessage(action === "Hint" ? "Give me a hint" : action);
  }

  function selectDay(day: number) {
    setActiveDay(day);
    setLessonStarted(false);
    setHintCount(0);
    mentor.resetMessages([
      {
        role: "mentor",
        text: `${lessonDetails[day].topic}. ${lessonDetails[day].firstStep}`,
      },
    ]);
    setNotice(`Day ${day} selected — your workspace is ready.`);
  }

  return (
    <main className={`app-shell ${focusMode ? "focus-active" : ""}`}>
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeDay={activeDay}
        onDaySelect={selectDay}
      />

      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="icon-button menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <span>Learning path</span><span className="crumb-slash">/</span><span className="crumb-current">Module developer</span>
          </div>
          <div className="topbar-actions">
            {focusMode && (
              <button className="focus-exit" onClick={() => setFocusMode(false)}>
                Exit focus <kbd>Esc</kbd>
              </button>
            )}
            <div className="streak-pill"><Flame size={15} fill="currentColor" /><span>6</span></div>
            <button className="search-button" onClick={() => setNotice("Search and command palette are coming soon.")}>
              <Search size={15} /><span>Search anything</span><kbd><Command size={11} /> K</kbd>
            </button>
            <button className="icon-button help-button" aria-label="Help"><CircleHelp size={18} /></button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date())} <span className="eyebrow-separator">/</span> DAY 09 OF 30</div>
              <h1>Build it. Prove it. Move on.</h1>
              <p className="welcome-subtitle">Today’s requirement: a secure Drupal 7 menu callback. No pass, no progression.</p>
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

          <section className="summary-grid strict-scorecard" aria-label="Strict progress scorecard">
            <article className="summary-card">
              <span className="card-overline">EXERCISE PASS RATE <span className="demo-data-tag">SAMPLE DATA</span></span>
              <strong className="summary-number">67<span>%</span></strong>
              <span className="summary-note">4 passed / 6 graded</span>
            </article>
            <article className="summary-card">
              <span className="card-overline">WEAKEST SKILL</span>
              <strong className="summary-number">Module dev</strong>
              <span className="summary-note">34% mastery · priority review</span>
            </article>
            <article className="summary-card">
              <span className="card-overline">OVERDUE REVIEWS</span>
              <strong className="summary-number">3 <span>items</span></strong>
              <span className="summary-note">Oldest review: 2 days overdue</span>
            </article>
            <article className="summary-card gate-summary">
              <span className="card-overline">LEVEL 2 GATE</span>
              <strong className="summary-number">85<span>% required</span></strong>
              <span className="summary-note">Locked · 7 days remaining</span>
            </article>
          </section>

          <div className="content-grid">
            <div className="lesson-column">
              <section className="mission-card">
                <div className="mission-topline">
                  <div className="mission-tag"><span /> DAY {activeDay} <span className="tag-divider">/</span> MODULE DEVELOPMENT</div>
                  <button className="text-icon" aria-label="More mission options"><MoreHorizontal size={19} /></button>
                </div>
                <div className="mission-main">
                  <div className="mission-copy">
                    <h2>Secure menu callback</h2>
                    <p>Register an admin report path. Restrict it to editors using Drupal 7’s permission API.</p>
                    <div className="mission-meta">
                      <span><AlarmClock size={14} /> 25 min</span><i />
                      <span><FlaskConical size={14} /> 1 attempt remaining</span><i />
                      <span><ShieldCheck size={14} /> Pass mark 80</span>
                    </div>
                    <div className="mission-gate"><LockKeyhole size={14} /><span>Level gate: <strong>85%</strong> to unlock Level 3</span></div>
                  </div>
                  <div className="exercise-editor">
                    <div className="editor-topbar"><span><Code2 size={13} /> d7_mentor.module</span><span className="editor-draft">DRAFT</span></div>
                    <div className="editor-body">
                      <div className="line-numbers" aria-hidden="true">{attemptCode.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                      <textarea aria-label="Exercise code draft" spellCheck={false} value={attemptCode} onChange={(event) => { setAttemptCode(event.target.value); setAttemptSaved(false); }} />
                    </div>
                    <div className="editor-footer">
                      <span><span className="offline-dot" /> Sandbox unavailable</span>
                      <button className="primary-button" onClick={() => { setAttemptSaved(true); setNotice("Draft held in this page session. Sandbox is not connected; code was not executed or graded."); }}>
                        <Play size={13} fill="currentColor" /> Keep draft
                      </button>
                    </div>
                    {attemptSaved && <div className="editor-feedback" role="status">Draft held for this session · Not run · Not graded</div>}
                  </div>
                </div>
                <div className="mission-footer">
                  <div className="footer-progress"><span>SUBMISSION RUBRIC</span><strong>Function 50 · Quality 20 · Security 15 · Practices 10 · Efficiency 5</strong></div>
                  <Link className="footer-link" href="/practice">More exercises <ArrowRight size={14} /></Link>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div><h2>30-day route</h2><span className="map-subtitle">Level 2 · day 2 of 9 · gate requires 85%</span></div>
                  <Link className="subtle-link" href="/skills">Readiness details <ArrowRight size={14} /></Link>
                </div>
                <div className="curriculum-card">
                  <div className="curriculum-top">
                    <div className="curriculum-level-icon"><Code2 size={17} /></div>
                    <div className="curriculum-title"><span>LEVEL 02 <b>·</b> DAYS 08—16</span><strong>Module developer</strong></div>
                    <div className="level-progress"><span>2 of 9 days · 7 until level gate</span><div className="level-track"><i /></div></div>
                    <button className="icon-button card-menu" aria-label="Curriculum options"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="curriculum-days">
                    {learningDays.slice(0, 5).map((lesson, index) => (
                      <button
                        key={lesson.day}
                        className={`curriculum-day ${lesson.state} ${activeDay === lesson.day ? "selected" : ""}`}
                        onClick={() => lesson.state !== "locked" && lesson.state !== "upcoming" && selectDay(lesson.day)}
                        disabled={lesson.state === "locked" || lesson.state === "upcoming"}
                        aria-label={`Day ${lesson.day}: ${lesson.title}`}
                      >
                        <span className="curriculum-node">{lesson.state === "done" ? <Check size={13} /> : lesson.state === "locked" ? <LockKeyhole size={12} /> : lesson.day}</span>
                        <span className="curriculum-day-label">DAY {lesson.day}</span>
                        <span className="curriculum-day-name">{lesson.title}</span>
                        {index < 4 && <span className={`node-line ${index === 0 ? "line-done" : ""}`} />}
                      </button>
                    ))}
                    <button className="curriculum-more" onClick={() => setNotice("Complete today’s work to unlock the next milestone.")}><ArrowRight size={16} /><span>4 more<br />days</span></button>
                  </div>
                </div>
              </section>

              <div className="lower-grid">
                <section className="panel-card skills-card">
                  <div className="panel-heading"><div><span className="section-kicker">MASTERY</span><h3>Weakest skills first</h3></div><button className="text-icon" aria-label="Skill map options"><MoreHorizontal size={18} /></button></div>
                  <SkillBars />
                  <button className="subtle-link skill-link" onClick={() => setNotice("Full skill breakdown will be available in your profile.")}>View all 12 skills <ArrowRight size={13} /></button>
                </section>
                <section className="panel-card achievement-card">
                  <div className="panel-heading"><div><span className="section-kicker">REVIEW QUEUE</span><h3>Overdue: 3 concepts</h3></div><span className="review-count">ACTION REQUIRED</span></div>
                  <div className="review-queue">
                    <span>Hook access callbacks <strong>2d overdue</strong></span>
                    <span>Drupal DB placeholders <strong>1d overdue</strong></span>
                    <span>Form API validation <strong>Today</strong></span>
                  </div>
                  <Link className="subtle-link" href="/practice">Start oldest review <ArrowRight size={13} /></Link>
                </section>
              </div>
            </div>

            <aside className="mentor-panel" aria-label="Mentor and lesson progress">
              <div className="mentor-header">
                <div className="mentor-heading">
                  <div className="mentor-avatar"><Bot size={18} /><span /></div>
                  <div><strong>Your mentor</strong><span><i /> Strict mode · Online</span></div>
                </div>
                <button className="text-icon" aria-label="Mentor options"><MoreHorizontal size={19} /></button>
              </div>
              <div className="mentor-rule"><ShieldCheck size={14} /><span>I won’t hand you the answer. I’ll help you earn it.</span></div>
              <div className="chat-context"><span>LESSON {activeDay} · {detail.title.toUpperCase()}</span><span className="context-live"><i /> LIVE</span></div>
              <div className="chat-messages" aria-live="polite">
                {mentor.messages.slice(-5).map((message, index) => (
                  <div className={`chat-message ${message.role}`} key={`${message.role}-${index}-${message.text.slice(0, 12)}`}>
                    {message.role === "mentor" && <div className="message-avatar"><Bot size={14} /></div>}
                    <div className="message-bubble"><span>{message.text}</span></div>
                  </div>
                ))}
                {mentor.isSending && <div className="mentor-typing" role="status">Mentor is reviewing your message…</div>}
                {lessonStarted && (
                  <div className="lesson-started"><Sparkles size={13} /> Lesson workspace started</div>
                )}
              </div>
              {mentor.error && <div className="chat-error" role="alert">{mentor.error}</div>}
              <div className="quick-actions">
                {[
                  { label: "Hint", icon: Lightbulb },
                  { label: "Explain again", icon: MessageSquareText },
                  { label: "Show example", icon: Code2 },
                  { label: "Test me", icon: FlaskConical },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className="quick-action" onClick={() => handleQuickAction(label)}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
              {hintCount > 0 && (
                <div className="hint-meter" role="status">
                  <Lightbulb size={12} />
                  <span>{hintCount} of 3 hints used</span>
                  <strong>−{hintPenalty} pts</strong>
                </div>
              )}
              <form className="chat-composer" onSubmit={handleSubmit}>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={mentor.isSending ? "Mentor is responding..." : "Ask your mentor anything..."}
                  aria-label="Message your mentor"
                  disabled={mentor.isSending}
                />
                <div className="composer-bottom">
                  <span><span className="composer-status" /> Drupal 7 context active</span>
                  <button className="send-button" type="submit" aria-label="Send message" disabled={!draft.trim() || mentor.isSending}><Send size={15} /></button>
                </div>
              </form>
              <div className="mentor-footnote"><LockKeyhole size={12} /> Reference solution stays locked until a passing attempt.</div>

              <div className="today-progress">
                <div className="today-progress-head"><strong>Today’s checklist</strong><button className="text-icon" aria-label="Checklist options"><MoreHorizontal size={16} /></button></div>
                <div className="checklist-item complete"><span><Check size={11} /></span><div><strong>Review yesterday’s notes</strong><small>Done · 8 min</small></div><CheckCheck size={14} /></div>
                <div className="checklist-item complete"><span><Check size={11} /></span><div><strong>Module anatomy lesson</strong><small>Done · 18 min</small></div><CheckCheck size={14} /></div>
                <div className="checklist-item"><span className="check-empty" /><div><strong>Build a menu callback</strong><small>Exercise · 25 min</small></div><ArrowRight size={14} /></div>
                <div className="checklist-item"><span className="check-empty" /><div><strong>Daily knowledge check</strong><small>Quiz · 5 questions</small></div><ArrowRight size={14} /></div>
                <button className="checklist-link" onClick={() => setNotice("You have 2 of 5 daily objectives complete.")}>See all objectives <ArrowRight size={13} /></button>
              </div>
            </aside>
          </div>
          <footer className="page-footer"><span>Sample metrics · 4 of 6 passed · 3 reviews overdue · 1 attempt left</span><span>DRUPAL 7 TRACK <b>·</b> CURRICULUM V1.1</span></footer>
        </div>
      </section>
    </main>
  );
}
