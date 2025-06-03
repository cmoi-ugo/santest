import api from '@/services/api';
import { API } from '@/config';
import { Answer } from '@/features/quiz/types/question.types';

export const sessionApi = {
    getAllSessions: async (): Promise<string[]> => {
        const response = await api.get<Answer[]>(API.ENDPOINTS.ANSWERS);
        const uniqueSessions = Array.from(
            new Set(response.data.map(answer => answer.session_id))
        );
        return uniqueSessions;
    },

    deleteSession: async (sessionId: string): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.ANSWERS}/by-session/${sessionId}`);
    }
};