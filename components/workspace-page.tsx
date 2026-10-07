"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { MentorMessage, useMentorChat } from "@/hooks/use-mentor-chat";
import {
  ArrowRight,
  AlarmClock,
  BookOpen,
  Bot,
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
    description: "Start at Day 1. Progress and assessment history will appear here once saving and grading are implemented.",
  },
  practice: {
    eyebrow: "HANDS-ON TRAINING",
    title: "Practice lab",
    description: "Preview the planned Drupal 7 challenges. Exercise execution and grading are not connected yet.",
  },
  mentor: {
    eyebrow: "YOUR STRICT DRUPAL 7 COACH",
    title: "Mentor chat",
    description: "Ask a question or request a beginner-friendly explanation. Chat is live; learner progress is not saved.",
  },
  skills: {
    eyebrow: "YOUR LEARNER PROFILE",
    title: "Skill profile",
    description: "Skills are not assessed yet. Complete placement and graded exercises to build this profile.",
  },
};

const skillData = [
  { name: "Site building", detail: "Content, fields, Views, and site configuration" },
  { name: "Module development", detail: "Hooks, Form API, Database API, and custom modules" },
  { name: "Security", detail: "Access checks, input handling, and secure coding" },
  { name: "Theming", detail: "Templates, preprocess functions, and responsive design" },
  { name: "Performance", detail: "Caching, query tuning, and production diagnosis" },
  { name: "Operations", detail: "Drush, deployments, backups, and environment parity" },
];

const practiceExercises = [
  { title: "Secure menu callback", skill: "Access control", time: "25 min", icon: ShieldCheck },
  { title: "Parameterize a database query", skill: "Database API", time: "20 min", icon: Code2 },
  { title: "Validate a Form API submission", skill: "Form API", time: "30 min", icon: FlaskConical },
];

function OverviewContent() {
  return (
    <>
      <section className="workspace-stats">
        <article className="workspace-stat">
          <div className="workspace-stat-icon mint-stat"><BookOpen size={17} /></div>
          <span className="card-overline">PROGRAM PROGRESS</span>
          <strong>Day 01 <small>of 30</small></strong>
          <span className="workspace-stat-note">New learner · placement pending</span>
        </article>
        <article className="workspace-stat">
          <div className="workspace-stat-icon amber-stat"><Zap size={17} /></div>
          <span className="card-overline">EXPERIENCE POINTS</span>
          <strong>Not tracked</strong>
          <span className="workspace-stat-note">Scoring and XP are not connected</span>
        </article>
        <article className="workspace-stat">
          <div className="workspace-stat-icon orange-stat"><Flame size={17} /></div>
          <span className="card-overline">CURRENT STREAK</span>
          <strong>Not tracked</strong>
          <span className="workspace-stat-note">Progress storage is not connected</span>
        </article>
        <article className="workspace-stat">
          <div className="workspace-stat-icon violet-stat"><Target size={17} /></div>
          <span className="card-overline">JOB READINESS</span>
          <strong>Not assessed</strong>
          <span className="workspace-stat-note">Complete assessments to establish mastery</span>
        </article>
      </section>
      <section className="workspace-grid">
        <article className="workspace-panel overview-mission">
          <div className="section-kicker">DAY 1 · START HERE</div>
          <h2>Foundations check</h2>
          <p>Tell the mentor what you already know about PHP, web basics, SQL, Git, and the command line. No prior Drupal knowledge or code is expected.</p>
          <div className="workspace-meta"><span><AlarmClock size={14} /> 20–30 min</span><span><FlaskConical size={14} /> Placement check planned</span></div>
          <Link className="primary-button" href="/learning"><Play size={14} fill="currentColor" /> Meet your mentor <ArrowRight size={15} /></Link>
        </article>
        <article className="workspace-panel">
          <div className="section-kicker">FIRST-DAY CHECKLIST</div>
          <h2>Nothing completed yet</h2>
          <div className="workspace-check"><span className="check-empty" /><div><strong>Tell the mentor your experience</strong><small>No code required</small></div></div>
          <div className="workspace-check"><span className="check-empty" /><div><strong>Complete the placement check</strong><small>Planned · not implemented</small></div></div>
          <div className="workspace-check"><span className="check-empty" /><div><strong>Set up Drupal 7</strong><small>After placement</small></div></div>
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
        <div><FlaskConical size={18} /><span><strong>3</strong> sample exercise previews</span></div>
        <div><Trophy size={18} /><span><strong>80/100</strong> planned pass mark</span></div>
        <div><LockKeyhole size={18} /><span>Execution and grading are not connected</span></div>
      </section>
      <section className="workspace-panel exercise-list">
        <div className="panel-heading"><div><span className="section-kicker">CURRICULUM PREVIEW</span><h2>Practice by doing</h2></div><span className="exercise-filter">Sample list <ArrowRight size={13} /></span></div>
        {practiceExercises.map(({ title, skill, time, icon: Icon }, index) => (
          <article className="exercise-row" key={title}>
            <div className={`exercise-icon ${index === 0 ? "exercise-active-icon" : ""}`}><Icon size={18} /></div>
            <div className="exercise-copy"><strong>{title}</strong><span>{skill} <i>·</i> <AlarmClock size={12} /> {time}</span></div>
            <span className="exercise-status">Preview</span>
            <button className="exercise-button" onClick={() => onNotice("These are static exercise previews. Learner-specific unlocking and grading are not connected yet.")}>
              View
            </button>
          </article>
        ))}
      </section>
      <div className="workspace-note"><ShieldCheck size={16} /><span><strong>Planned grading rules.</strong> The 80/100 pass mark and security checks are specified, but submissions are not currently run or graded.</span></div>
    </>
  );
}

function MentorContent() {
  const initialMessages: MentorMessage[] = [
    { role: "mentor", text: "Welcome. I will adapt to your experience. Tell me what you already know about PHP, HTML/CSS, SQL, Git, or the command line. If you are new, I will explain one small idea at a time, show a simple example, then guide your first step." },
  ];
  const [draft, setDraft] = useState("");
  const mentor = useMentorChat(initialMessages);

  function sendMessage(text: string) {
    const question = text.trim();
    if (!question || mentor.isSending) return;
    void mentor.sendMessage(question);
    setDraft("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  return (
    <section className="workspace-panel full-chat-panel">
      <div className="chat-panel-top"><div className="mentor-heading"><div className="mentor-avatar"><Bot size={18} /><span /></div><div><strong>Strict mentor</strong><span><i /> Gemini · server-side key</span></div></div><span className="demo-pill">STREAMING</span></div>
      <div className="mentor-rule"><ShieldCheck size={14} /> I won’t hand you the answer. I’ll help you earn it.</div>
      <div className="full-chat-messages" aria-live="polite">
        {mentor.messages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
            {message.role === "mentor" && <div className="message-avatar"><Bot size={14} /></div>}
            <div className="message-bubble"><span>{message.text}</span></div>
          </div>
        ))}
        {mentor.isSending && <div className="mentor-typing" role="status">Mentor is reviewing your message…</div>}
      </div>
      {mentor.error && <div className="chat-error" role="alert">{mentor.error}</div>}
      <div className="mentor-shortcuts">
        <button onClick={() => sendMessage("Give me a hint")}><Lightbulb size={13} /> Hint</button>
        <button onClick={() => sendMessage("Test me")}><FlaskConical size={13} /> Test me</button>
        <button onClick={() => sendMessage("Can you show me an example?")}><Code2 size={13} /> Show example</button>
      </div>
      <form className="full-chat-composer" onSubmit={submit}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={mentor.isSending ? "Mentor is responding..." : "Ask your mentor anything..."} aria-label="Message your mentor" disabled={mentor.isSending} />
        <button className="send-button" type="submit" disabled={!draft.trim() || mentor.isSending} aria-label="Send message"><Send size={15} /></button>
      </form>
      <p className="chat-demo-note"><Sparkles size={13} /> Gemini chat is live. Learning progress and chat history are not saved yet.</p>
    </section>
  );
}

function SkillsContent() {
  return (
    <>
      <section className="skill-profile-banner">
        <div className="skill-profile-icon"><Gauge size={20} /></div>
        <div><span className="section-kicker">OVERALL JOB READINESS</span><strong>Not assessed</strong><p>No placement answers or graded attempts are available yet.</p></div>
      </section>
      <section className="workspace-panel detailed-skills">
        <div className="panel-heading"><div><span className="section-kicker">COMPETENCY BREAKDOWN</span><h2>Skills awaiting evidence</h2></div><span className="demo-pill">NO ASSESSMENTS</span></div>
        {skillData.map((skill) => (
          <div className="detailed-skill" key={skill.name}>
            <div className="detailed-skill-head"><div><strong>{skill.name}</strong><small>{skill.detail}</small></div><span>Not assessed</span></div>
          </div>
        ))}
      </section>
      <div className="workspace-note"><ShieldCheck size={16} /><span>Planned mastery rule: pass two different exercises at 80% or higher, at least one day apart. This rule is not enforced until grading and progress storage are implemented.</span></div>
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
          <div className="topbar-actions"><div className="streak-pill"><Flame size={15} fill="currentColor" /><span>—</span></div><span className="workspace-track-label"><Code2 size={13} /> DRUPAL 7 TRACK</span></div>
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
