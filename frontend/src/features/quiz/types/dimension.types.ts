export interface Dimension {
    id: number;
    quiz_id: number;
    name: string;
    description?: string;
    order: number;
}

export interface DimensionCreateInput {
    quiz_id: number;
    name: string;
    description?: string;
    order?: number;
}

export interface DimensionUpdateInput {
    name?: string;
    description?: string;
    order?: number;
}

export interface QuestionDimensionLink {
    question_id: number;
    dimension_id: number;
    weight: number;
}

export interface DimensionScoringRule {
    id: number;
    dimension_id: number;
    question_id: number;
    answer_value: string;
    score: number;
}

export interface DimensionScoringRuleCreateInput {
    dimension_id: number;
    question_id: number;
    answer_value: string;
    score: number;
}

export interface DimensionAdvice {
    id: number;
    dimension_id: number;
    min_score: number;
    max_score: number;
    title: string;
    advice: string;
    severity: 'info' | 'warning' | 'danger';
}

export interface DimensionAdviceCreateInput {
    dimension_id: number;
    min_score: number;
    max_score: number;
    title: string;
    advice: string;
    severity: 'info' | 'warning' | 'danger';
}

export interface DimensionAdviceUpdateInput {
    min_score?: number;
    max_score?: number;
    title?: string;
    advice?: string;
    severity?: 'info' | 'warning' | 'danger';
}

export interface DimensionScore {
    dimension_id: number;
    dimension_name: string;
    score: number;
    max_score: number;
    percentage: number;
    advice?: DimensionAdvice;
}

export interface QuizScoreResult {
    session_id: string;
    quiz_id: number;
    dimension_scores: DimensionScore[];
    completion_date: string;
}