import api from '@/services/api';
import { API } from '@/config';
import { Favorite } from '@/features/quiz/types/favorite.types';

export const favoriteApi = {
  // Récupérer tous les favoris
  getAll: async (): Promise<Favorite[]> => {
    const response = await api.get<Favorite[]>(`${API.ENDPOINTS.FAVORITES}`);
    return response.data;
  },

  // Ajouter un quiz aux favoris
  addToFavorites: async (quizId: number): Promise<Favorite> => {
    const data = { quiz_id: quizId };
    const response = await api.post<Favorite>(`${API.ENDPOINTS.FAVORITES}`, data);
    return response.data;
  },

  // Supprimer un quiz des favoris
  removeFromFavorites: async (quizId: number): Promise<void> => {
    await api.delete(`${API.ENDPOINTS.FAVORITES}/${quizId}`);
  },

  // Vérifier si un quiz est dans les favoris
  checkFavorite: async (quizId: number): Promise<boolean> => {
    const response = await api.get<{ is_favorite: boolean }>(`${API.ENDPOINTS.FAVORITES}/check/${quizId}`);
    return response.data.is_favorite;
  }
};