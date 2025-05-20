import { QuizCreateInput } from './quiz.types';
import { QuestionType } from './question.types';
import { DimensionAdviceCreateInput, DimensionScoringRuleCreateInput } from './dimension.types';

export interface ExportedQuestion {
  text: string;
  question_type: QuestionType;
  options: any;
  required: boolean;
  order: number;
}

export interface ExportedDimension {
  name: string;
  description?: string;
  order: number;
}

export interface ExportedQuestionDimension {
  question_id: number;
  dimension_id: number;
  weight: number;
}

export interface QuizExport {
  quiz: QuizCreateInput;
  questions: ExportedQuestion[];
  dimensions: ExportedDimension[];
  dimension_advices: Array<Omit<DimensionAdviceCreateInput, 'dimension_id'> & { dimension_id: number }>;
  scoring_rules: Array<Omit<DimensionScoringRuleCreateInput, 'dimension_id'> & { dimension_id: number }>;
  question_dimensions: ExportedQuestionDimension[];
  version: string;
}

export interface ImportQuizRequest {
  quizFile: File | null;
}

export interface ImportQuizResponse {
  success: boolean;
  quiz_id?: number;
  error?: string;
}