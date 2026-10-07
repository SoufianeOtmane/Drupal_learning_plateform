"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Flame,
  FlaskConical,
  Gauge,
  GraduationCap,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

export const learningDays = [
  { day: 8, title: "Module anatomy", state: "done" },
  { day: 9, title: "Menu system", state: "current" },
  { day: 10, title: "Form API", state: "upcoming" },
  { day: 11, title: "Database API", state: "locked" },
  { day: 12, title: "Render API", state: "locked" },
  { day: 13, title: "Entity & fields", state: "locked" },
  { day: 14, title: "Blocks & cron", state: "locked" },
] as const;

const navigation = [
  { href: "/overview", label: "Overview", icon: Gauge },
  { href: "/learning", label: "Learning path", icon: BookOpen },
  { href: "/practice", label: "Practice lab", icon: FlaskConical, badge: "2" },
  { href: "/mentor", label: "Mentor chat", icon: MessageSquareText },
  { href: "/skills", label: "Skill profile", icon: ShieldCheck },
];

type AppSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
  activeDay?: number;
  onDaySelect?: (day: number) => void;
};

export default function AppSidebar({
  mobileOpen,
  onClose,
  activeDay = 9,
  onDaySelect,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Code2 size={19} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">drupal<span>mentor</span></div>
            <div className="brand-caption">THE DEVELOPER TRACK</div>
          </div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu">
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
          {navigation.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? "nav-active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
              onClick={onClose}
            >
              <Icon size={17} />
              {label}
              {pathname === href && <span className="nav-dot" />}
              {badge && <span className="nav-count">{badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="path-heading">
          <span className="nav-label">YOUR 30-DAY PATH</span>
          <button className="text-icon" aria-label="Expand learning path" onClick={() => router.push("/learning")}>
            <MoreHorizontal size={18} />
          </button>
        </div>
        <div className="path-level">
          <span className="level-number">02</span>
          <div><strong>Module developer</strong><span>Day 8 — 16</span></div>
          <ChevronDown size={14} />
        </div>
        <div className="day-list" aria-label="Learning path days">
          {learningDays.map((lesson) => {
            const locked = lesson.state === "locked" || lesson.state === "upcoming";
            return (
              <button
                className={`day-item ${activeDay === lesson.day ? "day-active" : ""}`}
                key={lesson.day}
                onClick={() => {
                  if (locked) return;
                  onDaySelect?.(lesson.day);
                  if (pathname !== "/learning") router.push("/learning");
                  onClose();
                }}
                disabled={locked}
                aria-current={activeDay === lesson.day ? "step" : undefined}
              >
                <span className={`day-marker ${lesson.state}`}>
                  {lesson.state === "done" ? <Check size={12} /> : lesson.state === "locked" ? <LockKeyhole size={11} /> : lesson.day}
                </span>
                <span className="day-title">{lesson.title}</span>
                {lesson.state === "current" && <span className="day-now">NOW</span>}
              </button>
            );
          })}
          <Link className="show-days" href="/learning" onClick={onClose}>
            <Plus size={14} /> View all 30 days
          </Link>
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
    </>
  );
}
