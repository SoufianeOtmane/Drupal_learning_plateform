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
    text: "Start with the Day 1 web-request lesson at /learning. The placement test is planned but not implemented yet.",
    href: "/learning",
    link: "Go to the Day 1 lesson",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Learn in small steps",
    text: "A lesson presents one short concept. Ask the mentor about anything unclear; normal questions are answered directly, not turned into a quiz.",
    href: "/learning",
    link: "Open Day 1 web-request lesson",
    icon: Code2,
  },
  {
    number: "03",
    title: "Ask the mentor when stuck",
    text: "Use the mentor panel for open Q&A. It should answer first and avoid repeated follow-up questions. Chat history and skill level are not saved between sessions yet.",
    href: "/mentor",
    link: "Open Mentor chat",
    icon: MessageSquareText,
  },
  {
    number: "04",
    title: "Run, submit, and review",
    text: "Practice is a separate, clearly labeled activity with a task and submit/check action. The Day 1 sequence check is interactive but ungraded; code execution and formal grading are planned, not live.",
    href: "/practice",
    link: "Browse Practice lab",
    icon: FlaskConical,
  },
  {
    number: "05",
    title: "Clear the gate before advancing",
    text: "You explicitly finish a lesson when ready; the mentor does not keep extending it. Later, a deterministic grader records exercise results and a progression service enforces prerequisites and the 85% level gate. Gemini cannot pass or unlock anything.",
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
                <p>Teach one concept, leave room for open questions, offer an optional practice task, and let the learner finish explicitly.</p>
              </div>
            </div>
            <ol className="backend-task-list">
              <li><Check size={14} /><span>Ask what the learner has used before; do not assume PHP or Drupal knowledge.</span></li>
              <li><Check size={14} /><span>Explain one concept in plain language with a tiny, annotated example.</span></li>
              <li><Check size={14} /><span>Keep chat questions separate from the exercise; make practice clearly labeled with an objective and a check/submit action.</span></li>
              <li><Check size={14} /><span>Stop when the learner finishes. If they struggle during practice, explain differently; do not pretend chat answers were graded.</span></li>
            </ol>
            <div className="guide-security-note"><ShieldCheck size={16} /><span>Gemini is a tutor, not the grader. Day 1 has an ungraded practice check and an explicit finish button. Persistent learner records, placement, formal grading, and unlocks are not implemented yet.</span></div>
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
