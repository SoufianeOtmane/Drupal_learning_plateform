"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { readApiResponse } from "@/lib/read-api-response";
import type { LearningDay, DayQuestion } from "@/lib/curriculum";

type PublicDayQuestion = Omit<DayQuestion, "correctOptionId" | "explanation">;

type LessonProgress = LearningDay["lessons"][number] & {
  status: "not_started" | "in_progress" | "completed";
};

type DayAttempt = {
  id: number;
  status: "in_progress" | "completed";
  answers: Record<string, string>;
  score: number | null;
  passed: boolean | null;
  submittedAt: string | null;
};

type DayPayload = {
  day: {
    day: number;
    title: string;
    topic: string;
    lessons: LessonProgress[];
    questions: PublicDayQuestion[];
    passThreshold: number;
    allLessonsComplete: boolean;
    bestScore: number | null;
    passedAt: string | null;
    currentDay: number;
    attempt: DayAttempt | null;
  };
};

type DayActionResult = {
  attempt?: DayAttempt;
  answers?: Record<string, string>;
  nextDayUnlocked?: boolean;
};

export default function DayCurriculum({
  day,
  onContinue,
  onProgress,
}: {
  day: number;
  onContinue: (nextDay: number) => void;
  onProgress: () => void;
}) {
  const [data, setData] = useState<DayPayload["day"] | null>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDay() {
    setError("");
    try {
      const payload = await readApiResponse<DayPayload>(
        await fetch(`/api/curriculum/${day}`),
      );
      setData(payload.day);
      const firstUnanswered = payload.day.questions.findIndex(
        (question) => !payload.day.attempt?.answers[question.id],
      );
      if (firstUnanswered >= 0) setActiveQuestion(firstUnanswered);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this learning day.");
    }
  }

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    fetch(`/api/curriculum/${day}`)
      .then((response) => readApiResponse<DayPayload>(response))
      .then((payload) => {
        if (!active) return;
        setData(payload.day);
        const firstUnanswered = payload.day.questions.findIndex(
          (question) => !payload.day.attempt?.answers[question.id],
        );
        if (firstUnanswered >= 0) setActiveQuestion(firstUnanswered);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load this learning day.");
      });
    return () => {
      active = false;
    };
  }, [day]);

  async function postAction(body: Record<string, string | number>) {
    const payload = await readApiResponse<DayActionResult>(
      await fetch(`/api/curriculum/${day}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    return payload;
  }

  async function updateLesson(lesson: LessonProgress) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const action = lesson.status === "in_progress" ? "finish-lesson" : "start-lesson";
      await postAction({ action, lessonId: lesson.id });
      setNotice(
        action === "finish-lesson"
          ? `Completed: ${lesson.title}`
          : `Lesson started: ${lesson.title}`,
      );
      await loadDay();
      onProgress();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save lesson progress.");
    } finally {
      setBusy(false);
    }
  }

  async function startAssessment() {
    setBusy(true);
    setError("");
    try {
      const payload = await postAction({ action: "start-assessment" });
      if (payload.attempt) {
        setData((current) => current ? { ...current, attempt: payload.attempt! } : current);
        setActiveQuestion(0);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the checkpoint.");
    } finally {
      setBusy(false);
    }
  }

  async function answerQuestion(question: PublicDayQuestion, choiceId: string) {
    if (!data?.attempt || data.attempt.status !== "in_progress" || busy) return;
    setBusy(true);
    setError("");
    try {
      const payload = await postAction({
        action: "answer",
        attemptId: data.attempt.id,
        questionId: question.id,
        choiceId,
      });
      if (payload.answers) {
        setData((current) =>
          current?.attempt
            ? { ...current, attempt: { ...current.attempt, answers: payload.answers! } }
            : current,
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your answer.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAssessment() {
    if (!data?.attempt || busy) return;
    setBusy(true);
    setError("");
    try {
      const payload = await postAction({
        action: "submit-assessment",
        attemptId: data.attempt.id,
      });
      if (payload.attempt) {
        setData((current) => current
          ? {
              ...current,
              attempt: payload.attempt!,
              bestScore: payload.attempt!.passed
                ? Math.max(current.bestScore ?? 0, payload.attempt!.score ?? 0)
                : current.bestScore,
            }
          : current);
        setNotice(
          payload.attempt.passed
            ? day < 4
              ? `Passed with ${payload.attempt.score}%. Day ${day + 1} is unlocked.`
              : `Passed with ${payload.attempt.score}%. You completed the currently available curriculum.`
            : `You scored ${payload.attempt.score}%. Review the lessons and retry; ${data.passThreshold}% is required.`,
        );
        onProgress();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit the checkpoint.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <section className="day-course">
        {error ? <p className="placement-error" role="alert">{error}</p> : <p>Loading Day {day} lessons…</p>}
      </section>
    );
  }

  const attempt = data.attempt;
  const isTakingCheck = attempt?.status === "in_progress";
  const question = data.questions[activeQuestion];
  const answeredCount = attempt ? Object.keys(attempt.answers).length : 0;
  const allAnswered = answeredCount === data.questions.length;
  const canStartCheck = data.allLessonsComplete && !isTakingCheck;
  const passed = data.bestScore !== null;

  return (
    <section className="day-course" aria-labelledby={`day-${day}-title`}>
      <header className="day-course-header">
        <span className="section-kicker">DAY {String(day).padStart(2, "0")} · {data.lessons.length} SHORT LESSONS</span>
        <h2 id={`day-${day}-title`}>{data.title}</h2>
        <p>{data.topic}. Complete the lessons in order, then pass the checkpoint to unlock the next day.</p>
      </header>

      {error && <p className="placement-error" role="alert">{error}</p>}
      {notice && <p className="day-course-notice" role="status">{notice}</p>}

      <div className="day-lesson-list">
        {data.lessons.map((lesson, index) => {
          const previousComplete =
            index === 0 || data.lessons[index - 1].status === "completed";
          const canStart = previousComplete && lesson.status !== "completed";
          return (
            <article className={`day-lesson ${lesson.status}`} key={lesson.id}>
              <div className="day-lesson-number">{lesson.status === "completed" ? <CheckCircle2 size={17} /> : String(index + 1).padStart(2, "0")}</div>
              <div className="day-lesson-body">
                <span className="section-kicker">LESSON {index + 1} · {lesson.status.replace("_", " ").toUpperCase()}</span>
                <h3>{lesson.title}</h3>
                <p className="day-lesson-objective"><strong>Goal:</strong> {lesson.objective}</p>
                <p>{lesson.explanation}</p>
                <pre><code>{lesson.example}</code></pre>
                <p className="day-lesson-takeaway"><strong>Remember:</strong> {lesson.takeaway}</p>
                <button
                  className={lesson.status === "in_progress" ? "placement-secondary-button" : "placement-primary-button"}
                  onClick={() => void updateLesson(lesson)}
                  disabled={busy || lesson.status === "completed" || !canStart}
                >
                  {lesson.status === "completed"
                    ? "Lesson complete"
                    : lesson.status === "in_progress"
                      ? "Mark lesson complete"
                      : "Start lesson"}
                  {lesson.status === "completed" && <CheckCircle2 size={14} />}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="day-checkpoint" aria-labelledby={`day-${day}-checkpoint`}>
        <div className="placement-heading">
          <div>
            <span className="section-kicker">STRICT DAY GATE · {data.passThreshold}% REQUIRED</span>
            <h3 id={`day-${day}-checkpoint`}>Day {day} checkpoint</h3>
            <p>Ten stable questions. Answers are checked by the app; the mentor does not grade this checkpoint.</p>
          </div>
          {passed && <span className="placement-score">{data.bestScore}%</span>}
        </div>

        {passed && !isTakingCheck && (
          <div className="day-gate-passed">
            <CheckCircle2 size={18} />
            <span>
              <strong>Day {day} passed.</strong> Best score: {data.bestScore}%. You can revisit these lessons.
            </span>
            {day < 4 && (
              <button className="placement-primary-button" onClick={() => onContinue(day + 1)}>
                Continue to Day {day + 1} <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {!data.allLessonsComplete && (
          <p className="placement-gate-note">Complete all {data.lessons.length} lessons in order to open this checkpoint.</p>
        )}

        {canStartCheck && (
          <button className="placement-primary-button" onClick={() => void startAssessment()} disabled={busy}>
            {passed ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
            {passed ? "Retake checkpoint" : "Start checkpoint"}
          </button>
        )}

        {isTakingCheck && question && (
          <>
            <div className="placement-progress-row">
              <span>Question {activeQuestion + 1} of {data.questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="placement-progress"><i style={{ width: `${(answeredCount / data.questions.length) * 100}%` }} /></div>
            <div className="placement-question">
              <span>CHECKPOINT · {String(activeQuestion + 1).padStart(2, "0")}</span>
              <h4>{question.prompt}</h4>
            </div>
            <div className="placement-options" role="radiogroup" aria-label={`Day ${day} checkpoint answers`}>
              {question.options.map((option) => (
                <label
                  className={`placement-option ${attempt.answers[question.id] === option.id ? "selected" : ""}`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={`day-${day}-${question.id}`}
                    value={option.id}
                    checked={attempt.answers[question.id] === option.id}
                    onChange={() => void answerQuestion(question, option.id)}
                    disabled={busy}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>
            <div className="placement-controls">
              <button
                className="placement-secondary-button"
                onClick={() => setActiveQuestion((index) => Math.max(index - 1, 0))}
                disabled={activeQuestion === 0 || busy}
              >
                <ArrowLeft size={14} /> Previous
              </button>
              {activeQuestion < data.questions.length - 1 ? (
                <button
                  className="placement-primary-button"
                  onClick={() => setActiveQuestion((index) => Math.min(index + 1, data.questions.length - 1))}
                  disabled={busy}
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  className="placement-primary-button"
                  onClick={() => void submitAssessment()}
                  disabled={!allAnswered || busy}
                >
                  {busy ? <LoaderCircle className="placement-spinner" size={14} /> : <CheckCircle2 size={14} />}
                  Submit checkpoint
                </button>
              )}
            </div>
            {allAnswered && activeQuestion < data.questions.length - 1 && (
              <button className="placement-submit-link" onClick={() => void submitAssessment()} disabled={busy}>
                Submit completed checkpoint
              </button>
            )}
            {attempt.score !== null && !attempt.passed && (
              <p className="day-course-notice">Previous attempt: {attempt.score}%. You need {data.passThreshold}% to unlock the next day.</p>
            )}
          </>
        )}

        {data.allLessonsComplete && !passed && !isTakingCheck && attempt?.status === "completed" && (
          <p className="day-course-notice">
            Last attempt: {attempt.score}%. {data.passThreshold}% is required. Review the explanations above and retry when ready.
          </p>
        )}
      </section>
    </section>
  );
}
