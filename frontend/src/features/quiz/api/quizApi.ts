import api from '@/services/api';
import { API } from '@/config';

import type { Quiz, QuizCreateInput, QuizUpdateInput } from '../types/quiz.types';

/**
 * API pour la gestion des quiz
 */
export const quizApi = {
    /**
     * Récupère tous les quiz avec filtrage optionnel par type
     */
    getAll: async (quizTypeId?: number): Promise<Quiz[]> => {
        const params = quizTypeId !== undefined ? { quiz_type_id: quizTypeId } : {};
        const response = await api.get<Quiz[]>(API.ENDPOINTS.QUIZZES, { params });
        return response.data;
    },

    getById: async (id: number): Promise<Quiz> => {
        const response = await api.get<Quiz>(`${API.ENDPOINTS.QUIZZES}/${id}`);
        return response.data;
    },

    create: async (quizData: QuizCreateInput): Promise<Quiz> => {
        const response = await api.post<Quiz>(API.ENDPOINTS.QUIZZES, quizData);
        return response.data;
    },

    update: async (id: number, quizData: QuizUpdateInput): Promise<Quiz> => {
        const response = await api.put<Quiz>(`${API.ENDPOINTS.QUIZZES}/${id}`, quizData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.QUIZZES}/${id}`);
    },

    /**
     * Récupère les statistiques de quiz groupées par type
     */
    getStatsByType: async (): Promise<Array<{type_id: number, type_name: string, quiz_count: number}>> => {
        const response = await api.get(`${API.ENDPOINTS.QUIZZES}/stats-by-type`);
        return response.data;
    }
};