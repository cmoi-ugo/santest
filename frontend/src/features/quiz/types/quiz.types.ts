import { Question } from './question.types';

export interface Quiz {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    questions?: Question[];
}
  
export interface QuizCreateInput {
    title: string;
    description?: string;
    image_url?: string;
}
  
export interface QuizUpdateInput {
    title?: string;
    description?: string;
    image_url?: string;
}