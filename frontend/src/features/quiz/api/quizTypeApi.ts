import api from '@/services/api';
import { API } from '@/config';

import type { QuizType, QuizTypeCreateInput, QuizTypeUpdateInput } from '../types/quiz.types';

/**
 * API pour la gestion des types de quiz
 */
export const quizTypeApi = {
    getAll: async (): Promise<QuizType[]> => {
        const response = await api.get<QuizType[]>(API.ENDPOINTS.QUIZ_TYPES);
        return response.data;
    },

    getById: async (id: number): Promise<QuizType> => {
        const response = await api.get<QuizType>(`${API.ENDPOINTS.QUIZ_TYPES}/${id}`);
        return response.data;
    },

    create: async (typeData: QuizTypeCreateInput): Promise<QuizType> => {
        const response = await api.post<QuizType>(API.ENDPOINTS.QUIZ_TYPES, typeData);
        return response.data;
    },

    update: async (id: number, typeData: QuizTypeUpdateInput): Promise<QuizType> => {
        const response = await api.put<QuizType>(`${API.ENDPOINTS.QUIZ_TYPES}/${id}`, typeData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.QUIZ_TYPES}/${id}`);
    },

    /**
     * Crée les types de quiz par défaut
     */
    createDefaults: async (): Promise<QuizType[]> => {
        const response = await api.post<QuizType[]>(`${API.ENDPOINTS.QUIZ_TYPES}/create-defaults`);
        return response.data;
    }
};