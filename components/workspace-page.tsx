"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlarmClock,
  BookOpen,
  Bot,
  Check,
  Code2,
  Flame,
  FlaskConical,
  Gauge,
  Lightbulb,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import AppSidebar from "@/components/app-sidebar";

export type WorkspaceView = "overview" | "practice" | "mentor" | "skills";

type WorkspacePageProps = {
  view: WorkspaceView;
};

const pageInfo: Record<WorkspaceView, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "YOUR LEARNING AT A GLANCE",
    title: "Overview",
    description: "See what passed, what is overdue, and the next requirement to unlock.",
  },
  practice: {
    eyebrow: "HANDS-ON TRAINING",
    title: "Practice lab",
    description: "Build real Drupal 7 habits with focused challenges and strict review.",
  },
  mentor: {
    eyebrow: "YOUR STRICT DRUPAL 7 COACH",
    title: "Mentor chat",
    description: "Ask a question, request a hint, or talk through your own attempt.",
  },
  skills: {
    eyebrow: "YOUR LEARNER PROFILE",
    title: "Skill profile",
    description: "See demonstrated mastery, identify gaps, and prioritize the next review.",
  },
};

const skillData = [
  { name: "Site building", score: 76, tone: "mint", detail: "Content, fields, Views, and site configuration" },
  { name: "Module development", score: 34, tone: "violet", detail: "Hooks, Form API, Database API, and custom modules" },
  { name: "Security", score: 52, tone: "amber", detail: "Access checks, input handling, and secure coding" },
  { name: "Theming", score: 18, tone: "blue", detail: "Templates, preprocess functions, and responsive design" },
  { name: "Performance", score: 12, tone: "mint", detail: "Caching, query tuning, and production diagnosis" },
  { name: "Operations", score: 21, tone: "violet", detail: "Drush, deployments, backups, and environment parity" },
];

const practiceExercises = [
  { title: "Secure menu callback", skill: "Access control", level: "In progress", time: "25 min", icon: ShieldCheck },
  { title: "Parameterize a database query", skill: "Database API", level: "Ready", time: "20 min", icon: Code2 },
  { title: "Validate a Form API submission", skill: "Form API", level: "Ready", time: "30 min", icon: FlaskConical },
];

type ChatMessage = { role: "mentor" | "you"; text: string };

function OverviewContent() {
  return (
    <>
      <section className="workspace-stats">
        <article className="workspace-stat">
          <div className="workspace-stat-icon mint-stat"><BookOpen size={17} /></div>
          <span className="card-overline">PROGRAM PROGRESS</span>
          <strong>Day 09 <small>of 30</small></strong>
          <span className="workspace-stat-note">2 days ahead of your pace</span>
        </article>
        <article className="workspace-stat">
          <div className="workspace-stat-icon amber-stat"><Zap size={17} /></div>
          <span className="card-overline">EXPERIENCE POINTS</span>
          <strong>2,480 <small>XP</small></strong>
          <span className="workspace-stat-note">320 XP earned this week</span>
        </article>
        <article className="workspace-stat">
          <div className="workspace-stat-icon orange-stat"><Flame size={17} /></div>
          <span className="card-overline">CURRENT STREAK</span>
          <strong>6 <small>days</small></strong>
          <span className="workspace-stat-note">Best: 7 days · 1 day to match</span>
        </article>
        <article className="workspace-stat">
          <div className="workspace-stat-icon violet-stat"><Target size={17} /></div>
          <span className="card-overline">JOB READINESS</span>
          <strong>32<small>%</small></strong>
          <span className="workspace-stat-note">32% demonstrated mastery</span>
        </article>
      </section>
      <section className="workspace-grid">
        <article className="workspace-panel overview-mission">
          <div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div>
          <h2>The menu system</h2>
          <p>Today, learn how Drupal 7 connects paths, page callbacks, and access permissions with hook_menu().</p>
          <div className="workspace-meta"><span><AlarmClock size={14} /> 24 min</span><span><FlaskConical size={14} /> 3 exercises</span><span><Zap size={14} /> 120 XP</span></div>
          <Link className="primary-button" href="/learning"><Play size={14} fill="currentColor" /> Continue learning <ArrowRight size={15} /></Link>
        </article>
        <article className="workspace-panel">
          <div className="section-kicker">TODAY’S CHECKLIST</div>
          <h2>Two steps complete</h2>
          <div className="workspace-check"><span className="check-done"><Check size={12} /></span><div><strong>Review yesterday’s notes</strong><small>Done · 8 min</small></div></div>
          <div className="workspace-check"><span className="check-done"><Check size={12} /></span><div><strong>Module anatomy lesson</strong><small>Done · 18 min</small></div></div>
          <div className="workspace-check"><span className="check-empty" /><div><strong>Build a menu callback</strong><small>Exercise · 25 min</small></div></div>
          <div className="workspace-check"><span className="check-empty" /><div><strong>Daily knowledge check</strong><small>Quiz · 5 questions</small></div></div>
        </article>
      </section>
      <div className="workspace-shortcuts">
        <Link href="/practice"><FlaskConical size={16} /><span><strong>Practice lab</strong><small>Pick up a hands-on challenge</small></span><ArrowRight size={15} /></Link>
        <Link href="/mentor"><MessageSquareText size={16} /><span><strong>Talk to your mentor</strong><small>Get a hint without the solution</small></span><ArrowRight size={15} /></Link>
        <Link href="/skills"><ShieldCheck size={16} /><span><strong>Review your skills</strong><small>See strengths and focus areas</small></span><ArrowRight size={15} /></Link>
      </div>
    </>
  );
}

function PracticeContent({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <>
      <section className="practice-summary">
        <div><FlaskConical size={18} /><span><strong>3</strong> exercises in your queue</span></div>
        <div><Trophy size={18} /><span><strong>80/100</strong> pass mark</span></div>
        <div><LockKeyhole size={18} /><span>Solutions unlock after an honest attempt</span></div>
      </section>
      <section className="workspace-panel exercise-list">
        <div className="panel-heading"><div><span className="section-kicker">YOUR NEXT CHALLENGES</span><h2>Practice by doing</h2></div><span className="exercise-filter">All exercises <ArrowRight size={13} /></span></div>
        {practiceExercises.map(({ title, skill, level, time, icon: Icon }, index) => (
          <article className="exercise-row" key={title}>
            <div className={`exercise-icon ${index === 0 ? "exercise-active-icon" : ""}`}><Icon size={18} /></div>
            <div className="exercise-copy"><strong>{title}</strong><span>{skill} <i>·</i> <AlarmClock size={12} /> {time}</span></div>
            <span className={`exercise-status ${index === 0 ? "status-progress" : ""}`}>{level}</span>
            <button className="exercise-button" onClick={() => onNotice(index === 0 ? "Your menu callback challenge is ready on the Learning path." : "This exercise unlocks after you complete the current challenge.")}>
              {index === 0 ? "Resume" : <LockKeyhole size={14} />}
            </button>
          </article>
        ))}
      </section>
      <div className="workspace-note"><ShieldCheck size={16} /><span><strong>Strict grading is on.</strong> Security flaws fail automatically, and hint use lowers your score.</span></div>
    </>
  );
}

function MentorContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "mentor", text: "I’m your Drupal 7 mentor. Bring me a question or show me an attempt. I’ll guide you, but I won’t skip the work for you." },
    { role: "you", text: "What should I check before exposing a custom page callback?" },
    { role: "mentor", text: "Start with access. Which permission should be required, and what access callback will enforce it? Show me your hook_menu() item and I’ll review it." },
  ]);
  const [draft, setDraft] = useState("");

  function sendMessage(text: string) {
    const question = text.trim();
    if (!question) return;
    const normalized = question.toLowerCase();
    let answer = "Show me what you have tried so far. I’ll review your approach against Drupal 7 best practices.";
    if (normalized.includes("skip")) {
      answer = "No. Skipping is locked until you demonstrate the objective. Start with the access check.";
    } else if (normalized.includes("hint")) {
      answer = "Hint 1/3: Drupal 7 hook_menu() items can define an access callback and arguments. Try identifying the permission before writing the page output.";
    } else if (normalized.includes("example")) {
      answer = "I won’t hand over a full solution before an honest attempt. Sketch the menu item first and I’ll review it.";
    } else if (normalized.includes("test")) {
      answer = "Quick check: which Drupal 7 callback checks a named permission for the current user?";
    }
    setMessages((current) => [...current, { role: "you", text: question }, { role: "mentor", text: answer }]);
    setDraft("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  return (
    <section className="workspace-panel full-chat-panel">
      <div className="chat-panel-top"><div className="mentor-heading"><div className="mentor-avatar"><Bot size={18} /><span /></div><div><strong>Strict mentor</strong><span><i /> Drupal 7 context active</span></div></div><span className="demo-pill">DEMO CHAT</span></div>
      <div className="mentor-rule"><ShieldCheck size={14} /> I won’t hand you the answer. I’ll help you earn it.</div>
      <div className="full-chat-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
            {message.role === "mentor" && <div className="message-avatar"><Bot size={14} /></div>}
            <div className="message-bubble"><span>{message.text}</span></div>
          </div>
        ))}
      </div>
      <div className="mentor-shortcuts">
        <button onClick={() => sendMessage("Give me a hint")}><Lightbulb size={13} /> Hint</button>
        <button onClick={() => sendMessage("Test me")}><FlaskConical size={13} /> Test me</button>
        <button onClick={() => sendMessage("Can you show me an example?")}><Code2 size={13} /> Show example</button>
      </div>
      <form className="full-chat-composer" onSubmit={submit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask your mentor anything..." aria-label="Message your mentor" />
        <button className="send-button" type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={15} /></button>
      </form>
      <p className="chat-demo-note"><Sparkles size={13} /> Frontend demo: replies are preset and aren’t connected to an AI provider yet.</p>
    </section>
  );
}

function SkillsContent() {
  return (
    <>
      <section className="skill-profile-banner">
        <div className="skill-profile-icon"><Gauge size={20} /></div>
        <div><span className="section-kicker">OVERALL JOB READINESS</span><strong>32<span>%</span></strong><p>Priority gaps: module development (34%) and theming (18%).</p></div>
        <div className="skill-profile-track"><span /></div>
      </section>
      <section className="workspace-panel detailed-skills">
        <div className="panel-heading"><div><span className="section-kicker">COMPETENCY BREAKDOWN</span><h2>Six skills, one developer</h2></div><span className="demo-pill">UPDATED TODAY</span></div>
        {skillData.map((skill) => (
          <div className="detailed-skill" key={skill.name}>
            <div className="detailed-skill-head"><div><strong>{skill.name}</strong><small>{skill.detail}</small></div><span>{skill.score}%</span></div>
            <div className="skill-track"><span className={`skill-fill ${skill.tone}`} style={{ width: `${skill.score}%` }} /></div>
          </div>
        ))}
      </section>
      <div className="workspace-note"><ShieldCheck size={16} /><span>Skills count as mastered only after passing two different exercises at least one day apart.</span></div>
    </>
  );
}

export default function WorkspacePage({ view }: WorkspacePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const info = pageInfo[view];

  return (
    <main className="app-shell">
      <AppSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="icon-button menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <span>Workspace</span><span className="crumb-slash">/</span><span className="crumb-current">{info.title}</span>
          </div>
          <div className="topbar-actions"><div className="streak-pill"><Flame size={15} fill="currentColor" /><span>6</span></div><span className="workspace-track-label"><Code2 size={13} /> DRUPAL 7 TRACK</span></div>
        </header>
        <div className="dashboard-content workspace-content">
          <div className="workspace-hero">
            <div className="eyebrow"><span className="live-dot" /> {info.eyebrow}</div>
            <h1>{info.title}</h1>
            <p>{info.description}</p>
          </div>
          {notice && <div className="notice-banner" role="status"><Sparkles size={15} /> {notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
          {view === "overview" && <OverviewContent />}
          {view === "practice" && <PracticeContent onNotice={setNotice} />}
          {view === "mentor" && <MentorContent />}
          {view === "skills" && <SkillsContent />}
          <footer className="page-footer"><span>Built for the real world, one hook at a time.</span><span><ShieldCheck size={13} /> STRICT MODE <b>·</b> {view.toUpperCase()}</span></footer>
        </div>
      </section>
    </main>
  );
}
