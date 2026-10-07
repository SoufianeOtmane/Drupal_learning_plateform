"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import type { PlacementSkill } from "@/lib/learner-types";

type Question = {
  id: string;
  skill: PlacementSkill;
  prompt: string;
  options: { id: string; text: string }[];
};

type Result = {
  overallScore: number;
  skills: Record<PlacementSkill, { score: number; correct: number; total: number }>;
  recommendedLevel: number;
  recommendedLevelTitle: string;
  recommendationReason: string;
  submittedAt: string;
};

type Attempt = {
  id: number;
  status: "in_progress" | "completed";
  answers: Record<string, string>;
  result: Result | null;
};

type PlacementResponse = {
  questions: Question[];
  attempt: Attempt | null;
};

const skillLabels: Record<PlacementSkill, string> = {
  php: "PHP",
  web: "Web basics",
  sql: "SQL",
  git_cli: "Git & command line",
  drupal: "Drupal 7",
};

async function readPayload<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "The request could not be completed.");
  return payload;
}

export default function PlacementAssessment({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/placement")
      .then(readPayload<PlacementResponse>)
      .then((payload) => {
        if (!active) return;
        setQuestions(payload.questions);
        setAttempt(payload.attempt);
        const firstUnanswered = payload.questions.findIndex(
          (question) => !payload.attempt?.answers[question.id],
        );
        if (firstUnanswered >= 0) setActiveIndex(firstUnanswered);
        if (payload.attempt?.status === "completed") onComplete();
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load the placement check.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onComplete]);

  async function startAttempt() {
    setBusy(true);
    setError("");
    try {
      const payload = await readPayload<{ attempt: Attempt }>(
        await fetch("/api/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        }),
      );
      setAttempt(payload.attempt);
      setActiveIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the placement check.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseAnswer(question: Question, choiceId: string) {
    if (!attempt || attempt.status !== "in_progress" || busy) return;
    setBusy(true);
    setError("");
    try {
      const payload = await readPayload<{ answers: Record<string, string> }>(
        await fetch("/api/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "answer",
            attemptId: attempt.id,
            questionId: question.id,
            choiceId,
          }),
        }),
      );
      setAttempt({ ...attempt, answers: payload.answers });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your answer.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAttempt() {
    if (!attempt || busy || Object.keys(attempt.answers).length !== questions.length) return;
    setBusy(true);
    setError("");
    try {
      const payload = await readPayload<{ attempt: Attempt }>(
        await fetch("/api/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit", attemptId: attempt.id }),
        }),
      );
      setAttempt(payload.attempt);
      onComplete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit your answers.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <section className="placement-panel" aria-live="polite">Loading your placement check…</section>;
  }

  const question = questions[activeIndex];
  const answeredCount = attempt ? Object.keys(attempt.answers).length : 0;
  const isTaking = attempt?.status === "in_progress";
  const result = attempt?.result;

  return (
    <section className="placement-panel" aria-labelledby="placement-title">
      <div className="placement-heading">
        <div>
          <span className="section-kicker">DAY 1 · STARTING-POINT ASSESSMENT</span>
          <h2 id="placement-title">
            {result ? "Your learning starting point" : isTaking ? "Placement check" : "Find your starting point"}
          </h2>
          <p>
            {result
              ? "This is a snapshot to guide what to learn first, not a pass/fail grade."
              : "20 short questions across PHP, web basics, SQL, Git, the command line, and Drupal 7. No code editor needed."}
          </p>
        </div>
        {result && <span className="placement-score">{result.overallScore}%</span>}
      </div>

      {error && <p className="placement-error" role="alert">{error}</p>}

      {result ? (
        <div className="placement-results">
          <div className="placement-recommendation">
            <span>RECOMMENDED START</span>
            <strong>Level {result.recommendedLevel} · {result.recommendedLevelTitle}</strong>
            <p>{result.recommendationReason}</p>
          </div>
          <div className="placement-skill-grid">
            {Object.entries(result.skills).map(([skill, score]) => (
              <div className="placement-skill-result" key={skill}>
                <div><strong>{skillLabels[skill as PlacementSkill]}</strong><span>{score.score}%</span></div>
                <div className="placement-meter"><i style={{ width: `${score.score}%` }} /></div>
                <small>{score.correct} of {score.total} correct</small>
              </div>
            ))}
          </div>
          <p className="placement-disclaimer">
            The recommendation is advisory. It does not certify mastery or unlock later lessons; progression rules will be added separately.
          </p>
          <p className="placement-disclaimer">
            Rule: below 60% across PHP, web, SQL, and Git/CLI recommends foundations; at 60% or above, Drupal below 60% recommends site building; 60% or above in both recommends module-development lessons.
          </p>
          <button className="placement-secondary-button" onClick={() => void startAttempt()} disabled={busy}>
            <RotateCcw size={14} /> Retake assessment
          </button>
        </div>
      ) : isTaking && question ? (
        <>
          <div className="placement-progress-row">
            <span>Question {activeIndex + 1} of {questions.length} · {skillLabels[question.skill]}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="placement-progress"><i style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
          <div className="placement-question">
            <span>QUESTION {String(activeIndex + 1).padStart(2, "0")}</span>
            <h3>{question.prompt}</h3>
          </div>
          <div className="placement-options" role="radiogroup" aria-label="Answer choices">
            {question.options.map((option) => (
              <label className={`placement-option ${attempt.answers[question.id] === option.id ? "selected" : ""}`} key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={attempt.answers[question.id] === option.id}
                  onChange={() => void chooseAnswer(question, option.id)}
                  disabled={busy}
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
          <div className="placement-controls">
            <button className="placement-secondary-button" onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))} disabled={activeIndex === 0 || busy}>
              <ArrowLeft size={14} /> Previous
            </button>
            {activeIndex < questions.length - 1 ? (
              <button className="placement-primary-button" onClick={() => setActiveIndex((index) => Math.min(index + 1, questions.length - 1))} disabled={busy}>
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button className="placement-primary-button" onClick={() => void submitAttempt()} disabled={busy || answeredCount !== questions.length}>
                {busy ? <LoaderCircle className="placement-spinner" size={14} /> : <CheckCircle2 size={14} />}
                Submit assessment
              </button>
            )}
          </div>
          {activeIndex < questions.length - 1 && answeredCount === questions.length && (
            <button className="placement-submit-link" onClick={() => void submitAttempt()} disabled={busy}>
              Submit completed assessment
            </button>
          )}
        </>
      ) : (
        <div className="placement-start">
          <div className="placement-start-icon"><CheckCircle2 size={19} /></div>
          <div>
            <strong>Stable questions, transparent scoring</strong>
            <p>Your answers are saved as you go. The app calculates category scores and recommends a starting level; the mentor does not grade this test.</p>
          </div>
          <button className="placement-primary-button" onClick={() => void startAttempt()} disabled={busy}>
            {busy ? <LoaderCircle className="placement-spinner" size={14} /> : null}
            Start assessment <ArrowRight size={14} />
          </button>
        </div>
      )}
    </section>
  );
}
