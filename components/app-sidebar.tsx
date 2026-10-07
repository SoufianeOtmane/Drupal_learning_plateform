"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Flame,
  FlaskConical,
  Gauge,
  GraduationCap,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Route,
  ShieldCheck,
  X,
} from "lucide-react";

export const learningDays: ReadonlyArray<{
  day: number;
  title: string;
  state: "done" | "current" | "upcoming" | "locked";
}> = [
  { day: 1, title: "Web request basics", state: "current" },
] as const;

const navigation = [
  { href: "/overview", label: "Overview", icon: Gauge },
  { href: "/learning", label: "Learning path", icon: BookOpen },
  { href: "/practice", label: "Practice lab", icon: FlaskConical },
  { href: "/mentor", label: "Mentor chat", icon: MessageSquareText },
  { href: "/skills", label: "Skill profile", icon: ShieldCheck },
  { href: "/guide", label: "Project guide", icon: Route },
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
  activeDay = 1,
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
          <Link href="/overview" className="brand-logo-link" aria-label="Drupal Mentor overview" onClick={onClose}>
            <Image
              src="/images/drupalmentor-logo.svg"
              alt="Drupal Mentor"
              width={168}
              height={45}
              priority
            />
          </Link>
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
          {navigation.map(({ href, label, icon: Icon }) => (
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
          <span className="level-number">00</span>
          <div><strong>Foundations</strong><span>Day 1 · web request basics</span></div>
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
            <div><strong>Streak not tracked</strong><span>Complete a lesson to begin</span></div>
            <ArrowUpRight size={15} />
          </div>
          <button className="profile-button">
            <div className="avatar">S</div>
            <div className="profile-name"><strong>New learner</strong><span>Level not assessed</span></div>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}
