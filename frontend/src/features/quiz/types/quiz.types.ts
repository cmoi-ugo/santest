import { Question } from './question.types';

export interface QuizType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QuizTypeCreateInput {
  name: string;
}

export interface QuizTypeUpdateInput {
  name?: string;
}

export interface Quiz {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    quiz_type_id?: number;
    created_at: string;
    updated_at: string;
    questions?: Question[];
    quiz_type?: QuizType;
}
  
export interface QuizCreateInput {
    title: string;
    description?: string;
    image_url?: string;
    quiz_type_id?: number;
}
  
export interface QuizUpdateInput {
    title?: string;
    description?: string;
    image_url?: string;
    quiz_type_id?: number;
}