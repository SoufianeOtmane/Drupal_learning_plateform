"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Database,
  FlaskConical,
  KeyRound,
  Layers3,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import AppSidebar from "@/components/app-sidebar";

const learningSteps = [
  {
    number: "01",
    title: "Open Learning path",
    text: "Start on Day 1 at /learning. Tell the mentor what you have used before; the placement test is planned but not implemented yet.",
    href: "/learning",
    link: "Go to the current exercise",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Learn in small steps",
    text: "If you are new, the mentor should explain one idea in plain language, show a tiny annotated example, check your understanding, then guide one small step. Code is not the starting requirement.",
    href: "/learning",
    link: "Open Day 1 foundations check",
    icon: Code2,
  },
  {
    number: "03",
    title: "Ask the mentor when stuck",
    text: "Use the mentor panel or open the full chat. It now asks about your experience and is instructed to scaffold beginner questions. Chat history and skill level are not saved between sessions yet.",
    href: "/mentor",
    link: "Open Mentor chat",
    icon: MessageSquareText,
  },
  {
    number: "04",
    title: "Run, submit, and review",
    text: "This is the planned loop, not a live feature yet: run work in an isolated Drupal 7 sandbox, receive a deterministic rubric score, fix issues, and retry within the attempt limit.",
    href: "/practice",
    link: "Browse Practice lab",
    icon: FlaskConical,
  },
  {
    number: "05",
    title: "Clear the gate before advancing",
    text: "The planned rule is: a deterministic grader records the result; the progression service unlocks a level only after its gate reaches 85% and prerequisites are satisfied. Gemini can explain results but cannot pass or unlock anything.",
    href: "/skills",
    link: "Check your Skill profile",
    icon: ShieldCheck,
  },
];

const backendTasks = [
  "Chat API: TypeScript route, server-held Gemini key, input limits, streaming, and provider error reporting.",
  "Learner data: PostgreSQL tables for profile, skills, lessons, progress, attempts, chat history, and review cards.",
  "Curriculum: versioned lesson and exercise definitions, prerequisites, strict rubrics, and level-gate rules.",
  "Grader: run functional checks, coding standards, and security checks; calculate scores deterministically.",
  "Progression service: persist grader results, enforce prerequisites and level gates, and never accept an AI chat claim as a pass.",
  "Sandbox worker: isolated Docker images for Drupal 7, PHP, and MariaDB; no network, strict resource limits, timed runs.",
  "Planner and reviews: daily plan, mastery updates, spaced repetition, attempt caps, and recovery scheduling.",
  "Security and operations: secret management, rate limits, backups, structured logs, and sandbox audit trails.",
];

export default function ProjectGuide() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="app-shell">
      <AppSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="icon-button menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <span>Workspace</span><span className="crumb-slash">/</span><span className="crumb-current">Project guide</span>
          </div>
          <div className="topbar-actions"><span className="workspace-track-label"><Workflow size={14} /> HOW IT WORKS</span></div>
        </header>
        <div className="dashboard-content workspace-content guide-content">
          <div className="workspace-hero">
            <div className="eyebrow"><span className="live-dot" /> START HERE</div>
            <h1>How to learn with Drupal Mentor</h1>
            <p>Follow the exercise loop. The app should only unlock progress when your work meets the rubric.</p>
          </div>

          <section className="guide-flow" aria-label="Learning workflow">
            {learningSteps.map(({ number, title, text, href, link, icon: Icon }, index) => (
              <article className="guide-step" key={number}>
                <div className="guide-step-rail">
                  <span>{number}</span>
                  {index < learningSteps.length - 1 && <i />}
                </div>
                <div className="guide-step-content">
                  <div className="guide-step-icon"><Icon size={17} /></div>
                  <div className="guide-step-copy">
                    <h2>{title}</h2>
                    <p>{text}</p>
                    <Link href={href}>{link} <ArrowRight size={13} /></Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="guide-backend">
            <div className="guide-backend-heading">
              <div className="guide-backend-icon"><ShieldCheck size={19} /></div>
              <div>
                <span className="section-kicker">BEGINNER-FRIENDLY TEACHING PLAN</span>
                <h2>Explain first. Then practise.</h2>
                <p>The mentor should not tell a beginner to build something from concepts they have not learned.</p>
              </div>
            </div>
            <ol className="backend-task-list">
              <li><Check size={14} /><span>Ask what the learner has used before; do not assume PHP or Drupal knowledge.</span></li>
              <li><Check size={14} /><span>Explain one concept in plain language with a tiny, annotated example.</span></li>
              <li><Check size={14} /><span>Ask one quick understanding check, then give a partially completed task or a single next step.</span></li>
              <li><Check size={14} /><span>Increase independence only after demonstrated understanding; if they struggle, reteach differently and practise a smaller step.</span></li>
            </ol>
            <div className="guide-security-note"><ShieldCheck size={16} /><span>Gemini is a tutor, not the grader. Passing and unlocking must come from stored results checked against deterministic tests and gate rules. Placement, saved progress, grading, and unlocks are not implemented yet.</span></div>
          </section>

          <section className="guide-backend">
            <div className="guide-backend-heading">
              <div className="guide-backend-icon"><Layers3 size={19} /></div>
              <div>
                <span className="section-kicker">RECOMMENDED BACKEND</span>
                <h2>TypeScript for the app, Docker for Drupal</h2>
                <p>Keep one language across the current Next.js frontend and application API. The Drupal exercise runtime remains an isolated PHP environment.</p>
              </div>
            </div>
            <div className="backend-stack">
              <div><Code2 size={15} /><span><strong>App + API</strong><small>TypeScript · Next.js Route Handlers</small></span></div>
              <div><Database size={15} /><span><strong>Persistent data</strong><small>PostgreSQL · learner and attempt history</small></span></div>
              <div><FlaskConical size={15} /><span><strong>Code execution</strong><small>Docker · PHP 7.4 · Drupal 7 · MariaDB</small></span></div>
              <div><KeyRound size={15} /><span><strong>AI credentials</strong><small>Server environment only · never browser code</small></span></div>
            </div>
            <h3>What still needs to be built</h3>
            <ul className="backend-task-list">
              {backendTasks.map((task) => <li key={task}><Check size={14} /> <span>{task}</span></li>)}
            </ul>
            <div className="guide-security-note"><ShieldCheck size={16} /><span>Do not commit API keys. A key pasted into chat should be revoked and replaced. Configure the new value in ignored <code>.env.local</code>.</span></div>
          </section>

          <footer className="page-footer"><span>The chatbot currently uses a server API route; persistent learner data and sandbox grading are next.</span><span>PROJECT GUIDE</span></footer>
        </div>
      </section>
    </main>
  );
}
