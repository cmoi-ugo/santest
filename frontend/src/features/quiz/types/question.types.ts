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

export const validateLinearScaleOptions = (options: LinearScaleOptions): string[] => {
    const errors: string[] = [];
    if (options.min_value < 1 || options.min_value > 10) {
        errors.push("La valeur minimale doit être entre 1 et 10");
    }
    
    if (options.max_value < 1 || options.max_value > 10) {
        errors.push("La valeur maximale doit être entre 1 et 10");
    }
    
    if (options.max_value <= options.min_value) {
        errors.push("La valeur maximale doit être supérieure à la valeur minimale");
    }
    
    if (options.max_value - options.min_value > 9) {
        errors.push("L'échelle ne peut pas avoir plus de 10 valeurs");
    }
    return errors;
};

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

export interface AnswerCreateInput {
    question_id: number;
    session_id: string;
    value: any;
}

export interface SubmitAnswersInput {
    session_id: string;
    answers: {
        question_id: number;
        value: any;
    }[];
}