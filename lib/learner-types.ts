export type PlacementSkill =
  | "php"
  | "web"
  | "sql"
  | "git_cli"
  | "drupal";

export type PlacementSkillResult = {
  score: number;
  correct: number;
  total: number;
};

export type PlacementSummary = {
  overallScore: number;
  skills: Record<PlacementSkill, PlacementSkillResult>;
  recommendedLevel: number;
  recommendedLevelTitle: string;
  recommendationReason: string;
  submittedAt: string;
};

export type LearnerState = {
  placement: PlacementSummary | null;
  lesson: {
    id: "day-1-web-request";
    status: "not_started" | "in_progress" | "completed";
    practiceAnswer: string | null;
    practiceCorrect: boolean | null;
    finishedAt: string | null;
  };
};
