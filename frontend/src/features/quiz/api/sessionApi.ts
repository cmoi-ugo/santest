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
  
    getLatestSessionForQuiz: async (quizId: number): Promise<string | null> => {
        const response = await api.get<Answer[]>(API.ENDPOINTS.ANSWERS, {
            params: { quiz_id: quizId }
        });
        
        if (response.data.length === 0) return null;
        const sortedAnswers = response.data.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return sortedAnswers[0].session_id;
    },

    deleteSession: async (sessionId: string): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.ANSWERS}/by-session/${sessionId}`);
    }
};