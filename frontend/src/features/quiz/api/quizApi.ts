import api from '@/services/api';
import { API } from '@/services/config';
import { Quiz, QuizCreateInput, QuizUpdateInput } from '@/features/quiz/types/quiz.types';

export const quizApi = {
  // Récupérer tous les quiz avec filtrage optionnel par types
  getAll: async (quizTypeIds?: number[]): Promise<Quiz[]> => {
    let url = API.ENDPOINTS.QUIZZES;
    
    if (quizTypeIds && quizTypeIds.length > 0) {
      const params = new URLSearchParams();
      quizTypeIds.forEach(id => params.append('quiz_type_ids', id.toString()));
      url += `?${params.toString()}`;
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

  // Ajouter un type à un quiz
  addType: async (quizId: number, typeId: number): Promise<Quiz> => {
    const response = await api.post<Quiz>(`${API.ENDPOINTS.QUIZZES}/${quizId}/types/${typeId}`);
    return response.data;
  },

  // Retirer un type d'un quiz
  removeType: async (quizId: number, typeId: number): Promise<Quiz> => {
    const response = await api.delete<Quiz>(`${API.ENDPOINTS.QUIZZES}/${quizId}/types/${typeId}`);
    return response.data;
  },

  // Obtenir les statistiques par type
  getStatsByType: async (): Promise<Array<{type_id: number, type_name: string, quiz_count: number}>> => {
    const response = await api.get(`${API.ENDPOINTS.QUIZZES}/stats-by-type`);
    return response.data;
  }
};