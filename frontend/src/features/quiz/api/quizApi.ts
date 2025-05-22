import api from '@/services/api';
import { API } from '@/services/config';
import { Quiz, QuizCreateInput, QuizUpdateInput } from '@/features/quiz/types/quiz.types';

export const quizApi = {
  // Récupérer tous les quiz avec filtrage optionnel par un type
  getAll: async (quizTypeId?: number): Promise<Quiz[]> => {
    let url = API.ENDPOINTS.QUIZZES;
    
    if (quizTypeId !== undefined) {
      url += `?quiz_type_id=${quizTypeId}`;
    }
    
    const response = await api.get<Quiz[]>(url);
    return response.data;
  },

  // Récupérer un quiz par ID
  getById: async (id: number): Promise<Quiz> => {
    const response = await api.get<Quiz>(`${API.ENDPOINTS.QUIZZES}/${id}`);
    return response.data;
  },

  // Récupérer les quiz d'un type spécifique
  getByType: async (typeId: number): Promise<Quiz[]> => {
    const response = await api.get<Quiz[]>(`${API.ENDPOINTS.QUIZZES}/by-type/${typeId}`);
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
  },

  // Obtenir les statistiques par type
  getStatsByType: async (): Promise<Array<{type_id: number, type_name: string, quiz_count: number}>> => {
    const response = await api.get(`${API.ENDPOINTS.QUIZZES}/stats-by-type`);
    return response.data;
  }
};