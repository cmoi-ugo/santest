/**
 * Types pour la gestion des questions et réponses de quiz
 */

export enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    CHECKBOX = "checkbox",
    DROPDOWN = "dropdown",
    LINEAR_SCALE = "linear_scale",
    TEXT = "text"
}

export interface QuestionOption {
    label: string;
    value: string;
}

export interface LinearScaleOptions {
    min_value: number;
    max_value: number;
    min_label?: string;
    max_label?: string;
}

export interface Question {
    id: number;
    quiz_id: number;
    text: string;
    question_type: QuestionType;
    options?: QuestionOption[] | LinearScaleOptions;
    required: boolean;
    order: number;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface QuestionCreateInput {
    quiz_id: number;
    text: string;
    question_type: QuestionType;
    options?: QuestionOption[] | LinearScaleOptions;
    required?: boolean;
    order?: number;
    image_url?: string;
}

export interface QuestionUpdateInput {
    text?: string;
    question_type?: QuestionType;
    options?: QuestionOption[] | LinearScaleOptions;
    required?: boolean;
    order?: number;
    image_url?: string;
}

export interface Answer {
    id: number;
    question_id: number;
    session_id: string;
    value: any;
    created_at: string;
}

export interface SubmitAnswersInput {
    session_id: string;
    answers: {
        question_id: number;
        value: any;
    }[];
}