"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlarmClock,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Code2,
  Command,
  Flame,
  FlaskConical,
  Gauge,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
  Zap,
} from "lucide-react";

type ChatMessage = {
  role: "mentor" | "you";
  text: string;
};

const lessons = [
  { day: 8, title: "Module anatomy", state: "done" },
  { day: 9, title: "Menu system", state: "current" },
  { day: 10, title: "Form API", state: "upcoming" },
  { day: 11, title: "Database API", state: "locked" },
  { day: 12, title: "Render API", state: "locked" },
  { day: 13, title: "Entity & fields", state: "locked" },
  { day: 14, title: "Blocks & cron", state: "locked" },
];

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

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 34;
  return (
    <div className="progress-ring" aria-label={`${value}% program progress`}>
      <svg viewBox="0 0 80 80" role="img" aria-hidden="true">
        <circle className="ring-track" cx="40" cy="40" r="34" />
        <circle
          className="ring-value"
          cx="40"
          cy="40"
          r="34"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span>{value}%</span>
    </div>
  );
}

function SkillBars() {
  const skills = [
    { name: "Site building", value: 76, color: "mint" },
    { name: "Module dev", value: 34, color: "violet" },
    { name: "Theming", value: 18, color: "blue" },
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
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [notice, setNotice] = useState("");
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
    const lower = cleanText.toLowerCase();
    let response =
      detail.firstStep;

    if (lower.includes("skip")) {
      response = "No. Skipping is locked until you demonstrate the objective. Start with the access callback.";
    } else if (lower.includes("hint")) {
      const nextHint = Math.min(hintCount + 1, 3);
      setHintCount(nextHint);
      const nextCost = hintCosts[nextHint - 1];
      const totalPenalty = hintCosts.slice(0, nextHint).reduce((total, cost) => total + cost, 0);
      response = `${detail.hints[nextHint - 1]} Hint ${nextHint} costs ${nextCost} points (${totalPenalty} total penalty).`;
    } else if (lower.includes("example")) {
      response = "I won’t provide a complete solution before an attempt. Write the menu item skeleton first; then I can review it.";
    } else if (lower.includes("test me")) {
      response = detail.testQuestion;
    } else if (lower.includes("explain")) {
      response = `Focus on one decision: ${detail.topic.toLowerCase()}. Explain the purpose in your own words, then connect it to a real Drupal 7 site.`;
    }

    setMessages((current) => [
      ...current,
      { role: "you", text: cleanText },
      { role: "mentor", text: response },
    ]);
    setDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  function handleQuickAction(action: string) {
    if (action === "Skip") {
      sendMessage("Can I skip this lesson?");
      return;
    }
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
    setMessages([
      {
        role: "mentor",
        text: `${lessonDetails[day].topic}. Start with the objective, then show me your own attempt before asking for a complete example.`,
      },
    ]);
    setNotice(`Day ${day} selected — your workspace is ready.`);
  }

  return (
    <main className={`app-shell ${focusMode ? "focus-active" : ""}`}>
      {mobileMenuOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Code2 size={19} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">drupal<span>mentor</span></div>
            <div className="brand-caption">THE DEVELOPER TRACK</div>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="track-switcher">
          <div className="track-icon"><GraduationCap size={17} /></div>
          <div className="track-copy"><span>Learning track</span><strong>Drupal 7 · Core</strong></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          <span className="nav-label">WORKSPACE</span>
          <button className="nav-item"><Gauge size={17} /> Overview</button>
          <button className="nav-item nav-active"><BookOpen size={17} /> Learning path <span className="nav-dot" /></button>
          <button className="nav-item"><FlaskConical size={17} /> Practice lab <span className="nav-count">2</span></button>
          <button className="nav-item"><MessageSquareText size={17} /> Mentor chat</button>
          <button className="nav-item"><ShieldCheck size={17} /> Skill profile</button>
        </nav>

        <div className="path-heading">
          <span className="nav-label">YOUR 30-DAY PATH</span>
          <button className="text-icon" aria-label="Expand learning path"><MoreHorizontal size={18} /></button>
        </div>
        <div className="path-level">
          <span className="level-number">02</span>
          <div><strong>Module developer</strong><span>Day 8 — 16</span></div>
          <ChevronDown size={14} />
        </div>
        <div className="day-list" aria-label="Learning path days">
          {lessons.map((lesson) => (
            <button
              className={`day-item ${activeDay === lesson.day ? "day-active" : ""}`}
              key={lesson.day}
              onClick={() => lesson.state !== "locked" && lesson.state !== "upcoming" && selectDay(lesson.day)}
              disabled={lesson.state === "locked" || lesson.state === "upcoming"}
              aria-current={activeDay === lesson.day ? "step" : undefined}
            >
              <span className={`day-marker ${lesson.state}`}>
                {lesson.state === "done" ? <Check size={12} /> : lesson.state === "locked" ? <LockKeyhole size={11} /> : lesson.day}
              </span>
              <span className="day-title">{lesson.title}</span>
              {lesson.state === "current" && <span className="day-now">NOW</span>}
            </button>
          ))}
          <button className="show-days" onClick={() => setNotice("The remaining days unlock as you master each level.")}>
            <Plus size={14} /> View all 30 days
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-icon"><Flame size={18} fill="currentColor" /></div>
            <div><strong>6 day streak</strong><span>One more day to beat your best</span></div>
            <ArrowUpRight size={15} />
          </div>
          <button className="profile-button">
            <div className="avatar">S</div>
            <div className="profile-name"><strong>Soufiane</strong><span>Apprentice · Level 2</span></div>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>

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
              <div className="eyebrow"><span className="live-dot" /> TUESDAY, OCTOBER 7, 2026 <span className="eyebrow-separator">/</span> WEEK 02</div>
              <h1>Good afternoon, Soufiane <span className="wave">✳</span></h1>
              <p className="welcome-subtitle">Small steps. Production-ready Drupal. Let’s keep the momentum.</p>
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

          <section className="summary-grid" aria-label="Learning progress summary">
            <article className="summary-card progress-summary">
              <div className="summary-copy">
                <span className="card-overline">PROGRAM PROGRESS</span>
                <strong className="summary-number">Day 09 <span>of 30</span></strong>
                <span className="summary-note"><span className="positive">+2 days</span> ahead of your pace</span>
              </div>
              <ProgressRing value={30} />
            </article>
            <article className="summary-card">
              <div className="summary-icon xp-icon"><Zap size={17} fill="currentColor" /></div>
              <span className="card-overline">TOTAL EXPERIENCE</span>
              <strong className="summary-number">2,480 <span>XP</span></strong>
              <span className="summary-note"><span className="positive">↑ 320</span> earned this week</span>
            </article>
            <article className="summary-card readiness-card">
              <div className="readiness-top"><span className="card-overline">JOB READINESS</span><ArrowUpRight size={15} /></div>
              <strong className="summary-number">32<span>%</span></strong>
              <div className="readiness-track"><span /></div>
              <span className="summary-note">Building a strong foundation</span>
            </article>
          </section>

          <div className="content-grid">
            <div className="lesson-column">
              <section className="mission-card">
                <div className="mission-topline">
                  <div className="mission-tag"><span /> TODAY’S MISSION <span className="tag-divider">·</span> DAY {activeDay}</div>
                  <button className="text-icon" aria-label="More mission options"><MoreHorizontal size={19} /></button>
                </div>
                <div className="mission-main">
                  <div className="mission-copy">
                    <div className="mission-kicker">LEVEL 02 <span>—</span> MODULE DEVELOPER</div>
                    <h2>{detail.title}<br /><span>{detail.topic}</span></h2>
                    <p>Understand how Drupal 7 discovers your code, then put it to work in a real callback.</p>
                    <div className="mission-meta">
                      <span><AlarmClock size={14} /> {detail.minutes} min</span><i />
                      <span><FlaskConical size={14} /> 3 exercises</span><i />
                      <span><Zap size={14} /> 120 XP</span>
                    </div>
                    <button className="primary-button" onClick={() => { setLessonStarted(true); setNotice(`Lesson ${activeDay} started. Your progress is saved locally.`); }}>
                      {lessonStarted ? <Check size={16} /> : <Play size={15} fill="currentColor" />}
                      {lessonStarted ? "Lesson in progress" : "Continue learning"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="mission-art" aria-hidden="true">
                    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                    <div className="art-glow" />
                    <div className="code-tile"><span className="tile-line tile-short" /><span className="tile-line" /><span className="tile-line tile-mid" /><span className="tile-line tile-short" /></div>
                    <div className="art-badge"><Code2 size={19} /></div>
                    <div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div>
                  </div>
                </div>
                <div className="mission-footer">
                  <div className="footer-progress"><span>YOUR DAY 09 PROGRESS</span><div className="mini-track"><span style={{ width: "42%" }} /></div><strong>2 <small>/ 5 complete</small></strong></div>
                  <button className="footer-link" onClick={() => setNotice("Your full daily plan is ready to explore.")}>View daily plan <ArrowRight size={14} /></button>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div><span className="section-kicker">YOUR CURRICULUM</span><h2>The path to mastery</h2></div>
                  <button className="subtle-link" onClick={() => setNotice("Your 30-day curriculum is shown in the sidebar.")}>Full curriculum <ArrowRight size={14} /></button>
                </div>
                <div className="curriculum-card">
                  <div className="curriculum-top">
                    <div className="curriculum-level-icon"><Code2 size={17} /></div>
                    <div className="curriculum-title"><span>LEVEL 02 <b>·</b> DAYS 08—16</span><strong>Module developer</strong></div>
                    <div className="level-progress"><span>2 of 9 days</span><div className="level-track"><i /></div></div>
                    <button className="icon-button card-menu" aria-label="Curriculum options"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="curriculum-days">
                    {lessons.slice(0, 5).map((lesson, index) => (
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
                  <div className="panel-heading"><div><span className="section-kicker">YOUR SKILL MAP</span><h3>Growing every day</h3></div><button className="text-icon" aria-label="Skill map options"><MoreHorizontal size={18} /></button></div>
                  <SkillBars />
                  <button className="subtle-link skill-link" onClick={() => setNotice("Full skill breakdown will be available in your profile.")}>View all 12 skills <ArrowRight size={13} /></button>
                </section>
                <section className="panel-card achievement-card">
                  <div className="panel-heading"><div><span className="section-kicker">RECENT UNLOCK</span><h3>A little recognition</h3></div><div className="badge-new">NEW</div></div>
                  <div className="achievement-content">
                    <div className="achievement-medal"><div><ShieldCheck size={23} /></div><span>✦</span></div>
                    <div><strong>Security-minded</strong><p>Spotted 5 security issues<br />in your code reviews.</p><span className="achievement-date">UNLOCKED YESTERDAY</span></div>
                  </div>
                  <button className="subtle-link" onClick={() => setNotice("Your achievements are updated as you master new skills.")}>All achievements <ArrowRight size={13} /></button>
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
                {messages.slice(-5).map((message, index) => (
                  <div className={`chat-message ${message.role}`} key={`${message.role}-${index}-${message.text.slice(0, 12)}`}>
                    {message.role === "mentor" && <div className="message-avatar"><Bot size={14} /></div>}
                    <div className="message-bubble"><span>{message.text}</span></div>
                  </div>
                ))}
                {lessonStarted && (
                  <div className="lesson-started"><Sparkles size={13} /> Lesson workspace started</div>
                )}
              </div>
              <div className="quick-actions">
                {[
                  { label: "Hint", icon: Lightbulb },
                  { label: "Explain again", icon: MessageSquareText },
                  { label: "Show example", icon: Code2 },
                  { label: "Test me", icon: FlaskConical },
                  { label: "Skip", icon: ArrowDown },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className={`quick-action ${label === "Skip" ? "skip-action" : ""}`} onClick={() => handleQuickAction(label)}>
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
                  placeholder="Ask your mentor anything..."
                  aria-label="Message your mentor"
                />
                <div className="composer-bottom">
                  <span><span className="composer-status" /> Drupal 7 context active</span>
                  <button className="send-button" type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={15} /></button>
                </div>
              </form>
              <div className="mentor-footnote"><LockKeyhole size={12} /> Solutions unlock after an honest attempt.</div>

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
          <footer className="page-footer"><span>Built for the real world, one hook at a time.</span><span><TerminalSquare size={13} /> DRUPAL 7 TRACK <b>·</b> CURRICULUM V1.1</span></footer>
        </div>
      </section>
    </main>
  );
}
