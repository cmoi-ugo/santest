export interface ResetStats {
  quizzes: number;
  questions: number;
  answers: number;
  dimensions: number;
  scoring_rules: number;
  advices: number;
  favorites: number;
  quiz_types: number;
}

export interface ResetPreview {
  message: string;
  items_to_delete: ResetStats;
  confirmation_required: string;
}

export interface ResetResult {
  message: string;
  deleted_items: {
    quizzes: number;
    questions: number;
    answers: number;
    dimensions: number;
    scoring_rules: number;
    advices: number;
    favorites: number;
    custom_quiz_types: number;
  };
  stats_before: ResetStats;
  stats_after: ResetStats;
  reset_timestamp: string;
}