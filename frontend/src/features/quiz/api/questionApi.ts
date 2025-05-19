import api from '@/services/api';
import { API } from '@/services/config';
import { 
    Question, 
    QuestionCreateInput, 
    QuestionUpdateInput,
    Answer,
    SubmitAnswersInput 
} from '@/features/quiz/types/question.types';

export const questionApi = {
    getAll: async (quizId?: number): Promise<Question[]> => {
        const params = quizId ? { quiz_id: quizId } : {};
        const response = await api.get<Question[]>(API.ENDPOINTS.QUESTIONS, { params });
        return response.data;
    },

    getById: async (id: number): Promise<Question> => {
        const response = await api.get<Question>(`${API.ENDPOINTS.QUESTIONS}/${id}`);
        return response.data;
    },

    create: async (questionData: QuestionCreateInput): Promise<Question> => {
        const response = await api.post<Question>(API.ENDPOINTS.QUESTIONS, questionData);
        return response.data;
    },

    update: async (id: number, questionData: QuestionUpdateInput): Promise<Question> => {
        const response = await api.put<Question>(`${API.ENDPOINTS.QUESTIONS}/${id}`, questionData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.QUESTIONS}/${id}`);
    },

    reorder: async (quizId: number, reorderedQuestions: { id: number; order: number }[]): Promise<void> => {
        await api.put(`${API.ENDPOINTS.QUESTIONS}/reorder`, {
            quiz_id: quizId,
            questions: reorderedQuestions
        });
    },

    submitAnswers: async (data: SubmitAnswersInput): Promise<Answer[]> => {
        const response = await api.post<Answer[]>(`${API.ENDPOINTS.ANSWERS}/submit`, data);
        return response.data;
    },

    getAnswers: async (sessionId?: string, questionId?: number): Promise<Answer[]> => {
        const params: any = {};
        if (sessionId) params.session_id = sessionId;
        if (questionId) params.question_id = questionId;
        
        const response = await api.get<Answer[]>(API.ENDPOINTS.ANSWERS, { params });
        return response.data;
    }
};