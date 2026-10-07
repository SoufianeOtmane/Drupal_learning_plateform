import type { PlacementSkill, PlacementSummary } from "@/lib/learner-types";
import {
  placementQuestions,
  placementSkillLabels,
} from "@/lib/placement-questions";

export type PlacementAnswers = Record<string, string>;

export function scorePlacement(answers: PlacementAnswers, submittedAt: Date) {
  const skills = Object.fromEntries(
    Object.keys(placementSkillLabels).map((skill) => {
      const questions = placementQuestions.filter((question) => question.skill === skill);
      const correct = questions.filter(
        (question) => answers[question.id] === question.correctOptionId,
      ).length;
      return [
        skill,
        {
          score: Math.round((correct / questions.length) * 100),
          correct,
          total: questions.length,
        },
      ];
    }),
  ) as Record<PlacementSkill, PlacementSummary["skills"][PlacementSkill]>;

  const correctAnswers = Object.values(skills).reduce((total, result) => total + result.correct, 0);
  const overallScore = Math.round((correctAnswers / placementQuestions.length) * 100);
  const foundationSkills: PlacementSkill[] = ["php", "web", "sql", "git_cli"];
  const foundationScore =
    foundationSkills.reduce((total, skill) => total + skills[skill].score, 0) /
    foundationSkills.length;

  let recommendedLevel: number;
  let recommendedLevelTitle: string;
  let recommendationReason: string;

  if (foundationScore < 60) {
    recommendedLevel = 0;
    recommendedLevelTitle = "Foundations (Day 1)";
    recommendationReason =
      "Your PHP, web, SQL, and command-line answers suggest starting with the foundations.";
  } else if (skills.drupal.score < 60) {
    recommendedLevel = 1;
    recommendedLevelTitle = "Drupal site building (Day 2)";
    recommendationReason =
      "Your foundations are in place; begin with Drupal site-building concepts before custom modules.";
  } else {
    recommendedLevel = 2;
    recommendedLevelTitle = "Drupal module development (Day 8)";
    recommendationReason =
      "Your foundations and Drupal answers support beginning with guided module-development lessons.";
  }

  return {
    overallScore,
    skills,
    recommendedLevel,
    recommendedLevelTitle,
    recommendationReason,
    submittedAt: submittedAt.toISOString(),
  } satisfies PlacementSummary;
}

export function validatePlacementAnswers(value: unknown): value is PlacementAnswers {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const entries = Object.entries(value);
  if (entries.length !== placementQuestions.length) return false;

  return placementQuestions.every((question) => {
    const choiceId = (value as Record<string, unknown>)[question.id];
    return (
      typeof choiceId === "string" &&
      question.options.some((option) => option.id === choiceId)
    );
  });
}
