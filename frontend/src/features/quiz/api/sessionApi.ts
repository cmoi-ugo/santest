import api from '@/services/api';
import { API } from '@/config';

import type { Answer } from '../types/question.types';

/**
 * API pour la gestion des sessions de réponses
 */
export const sessionApi = {
    /**
     * Récupère tous les identifiants de session uniques
     */
    getAllSessions: async (): Promise<string[]> => {
        const response = await api.get<Answer[]>(API.ENDPOINTS.ANSWERS);
        const uniqueSessions = Array.from(
            new Set(response.data.map(answer => answer.session_id))
        );
        return uniqueSessions;
    },

    /**
     * Supprime toutes les réponses d'une session
     */
    deleteSession: async (sessionId: string): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.ANSWERS}/by-session/${sessionId}`);
    }
};