import api from '@/services/api';
import { API } from '@/services/config';
import { QuizType, QuizTypeCreateInput, QuizTypeUpdateInput } from '@/features/quiz/types/quiz.types';

export const quizTypeApi = {
  // Récupérer tous les types
  getAll: async (): Promise<QuizType[]> => {
    const response = await api.get<QuizType[]>(API.ENDPOINTS.QUIZ_TYPES);
    return response.data;
  },

  // Récupérer un type par ID
  getById: async (id: number): Promise<QuizType> => {
    const response = await api.get<QuizType>(`${API.ENDPOINTS.QUIZ_TYPES}/${id}`);
    return response.data;
  },

  // Créer un nouveau type
  create: async (typeData: QuizTypeCreateInput): Promise<QuizType> => {
    const response = await api.post<QuizType>(API.ENDPOINTS.QUIZ_TYPES, typeData);
    return response.data;
  },

  // Mettre à jour un type
  update: async (id: number, typeData: QuizTypeUpdateInput): Promise<QuizType> => {
    const response = await api.put<QuizType>(`${API.ENDPOINTS.QUIZ_TYPES}/${id}`, typeData);
    return response.data;
  },

  // Supprimer un type
  delete: async (id: number): Promise<void> => {
    await api.delete(`${API.ENDPOINTS.QUIZ_TYPES}/${id}`);
  },

  // Créer les types par défaut
  createDefaults: async (): Promise<QuizType[]> => {
    const response = await api.post<QuizType[]>(`${API.ENDPOINTS.QUIZ_TYPES}/create-defaults`);
    return response.data;
  }
};