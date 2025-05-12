import api from '@/config/api';
import { API } from '@/config/constants';
import { Quiz, QuizCreateInput, QuizUpdateInput } from '@/features/quiz/types/quiz.types';

export const quizApi = {
  // Récupérer tous les quiz
  getAll: async (): Promise<Quiz[]> => {
    const response = await api.get<Quiz[]>(API.ENDPOINTS.QUIZZES);
    return response.data;
  },

  // Récupérer un quiz par ID
  getById: async (id: number): Promise<Quiz> => {
    const response = await api.get<Quiz>(`${API.ENDPOINTS.QUIZZES}/${id}`);
    return response.data;
  },

  // Créer un nouveau quiz
  create: async (quizData: QuizCreateInput): Promise<Quiz> => {
    const response = await api.post<Quiz>(API.ENDPOINTS.QUIZZES, quizData);
    return response.data;
  },

  // Mettre à jour un quiz
  update: async (id: number, quizData: QuizUpdateInput): Promise<Quiz> => {
    const response = await api.put<Quiz>(`${API.ENDPOINTS.QUIZZES}/${id}`, quizData);
    return response.data;
  },

  // Supprimer un quiz
  delete: async (id: number): Promise<void> => {
    await api.delete(`${API.ENDPOINTS.QUIZZES}/${id}`);
  }
};