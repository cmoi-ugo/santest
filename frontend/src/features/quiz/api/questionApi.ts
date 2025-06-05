import api from '@/services/api';
import { API } from '@/config';

import type { 
    Question, 
    QuestionCreateInput, 
    QuestionUpdateInput,
    Answer,
    SubmitAnswersInput 
} from '../types/question.types';

/**
 * API pour la gestion des questions et réponses
 */
export const questionApi = {
    /**
     * Récupère toutes les questions, optionnellement filtrées par quiz
     */
    getAll: async (quizId?: number): Promise<Question[]> => {
        const params = quizId ? { quiz_id: quizId } : {};
        const response = await api.get<Question[]>(API.ENDPOINTS.QUESTIONS, { params });
        return response.data;
    },

    getById: async (id: number): Promise<Question> => {
        const response = await api.get<Question>(`${API.ENDPOINTS.QUESTIONS}/${id}`);
        return response.data;
    },

    create: async (questionData: QuestionCreateInput): Promise<Question> => {
        const response = await api.post<Question>(API.ENDPOINTS.QUESTIONS, questionData);
        return response.data;
    },

    update: async (id: number, questionData: QuestionUpdateInput): Promise<Question> => {
        const response = await api.put<Question>(`${API.ENDPOINTS.QUESTIONS}/${id}`, questionData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.QUESTIONS}/${id}`);
    },

    /**
     * Réordonne les questions d'un quiz
     */
    reorder: async (quizId: number, reorderedQuestions: { id: number; order: number }[]): Promise<void> => {
        await api.put(`${API.ENDPOINTS.QUESTIONS}/reorder`, {
            quiz_id: quizId,
            questions: reorderedQuestions
        });
    },

    /**
     * Soumet les réponses d'un utilisateur pour une session
     */
    submitAnswers: async (data: SubmitAnswersInput): Promise<Answer[]> => {
        const response = await api.post<Answer[]>(`${API.ENDPOINTS.ANSWERS}/submit`, data);
        return response.data;
    },

    /**
     * Récupère les réponses avec filtrage optionnel
     */
    getAnswers: async (sessionId?: string, questionId?: number): Promise<Answer[]> => {
        const params: Record<string, any> = {};
        if (sessionId) params.session_id = sessionId;
        if (questionId) params.question_id = questionId;
        
        const response = await api.get<Answer[]>(API.ENDPOINTS.ANSWERS, { params });
        return response.data;
    }
};