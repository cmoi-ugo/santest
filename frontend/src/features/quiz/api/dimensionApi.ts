import api from '@/services/api';
import { API } from '@/config';
import { 
    Dimension, 
    DimensionCreateInput, 
    DimensionUpdateInput,
    DimensionScoringRule,
    DimensionScoringRuleCreateInput,
    DimensionAdvice,
    DimensionAdviceCreateInput,
    DimensionAdviceUpdateInput,
    QuizScoreResult
} from '@/features/quiz/types/dimension.types';

export const dimensionApi = {
    // Dimensions
    getAll: async (quizId?: number): Promise<Dimension[]> => {
        const params = quizId ? { quiz_id: quizId } : {};
        const response = await api.get<Dimension[]>(`${API.ENDPOINTS.DIMENSIONS}`, { params });
        return response.data;
    },

    getById: async (id: number): Promise<Dimension> => {
        const response = await api.get<Dimension>(`${API.ENDPOINTS.DIMENSIONS}/${id}`);
        return response.data;
    },

    create: async (dimensionData: DimensionCreateInput): Promise<Dimension> => {
        const response = await api.post<Dimension>(`${API.ENDPOINTS.DIMENSIONS}`, dimensionData);
        return response.data;
    },

    update: async (id: number, dimensionData: DimensionUpdateInput): Promise<Dimension> => {
        const response = await api.put<Dimension>(`${API.ENDPOINTS.DIMENSIONS}/${id}`, dimensionData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.DIMENSIONS}/${id}`);
    },

    // Règles de scoring
    getScoringRules: async (dimensionId: number): Promise<DimensionScoringRule[]> => {
        const response = await api.get<DimensionScoringRule[]>(`${API.ENDPOINTS.DIMENSIONS}/${dimensionId}/scoring-rules`);
        return response.data;
    },

    createScoringRule: async (ruleData: DimensionScoringRuleCreateInput): Promise<DimensionScoringRule> => {
        const response = await api.post<DimensionScoringRule>(`${API.ENDPOINTS.DIMENSIONS}/scoring-rules`, ruleData);
        return response.data;
    },

    deleteScoringRule: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.DIMENSIONS}/scoring-rules/${id}`);
    },

    // Conseils
    getAdvices: async (dimensionId: number): Promise<DimensionAdvice[]> => {
        const response = await api.get<DimensionAdvice[]>(`${API.ENDPOINTS.DIMENSIONS}/${dimensionId}/advices`);
        return response.data;
    },

    createAdvice: async (adviceData: DimensionAdviceCreateInput): Promise<DimensionAdvice> => {
        const response = await api.post<DimensionAdvice>(`${API.ENDPOINTS.DIMENSIONS}/advices`, adviceData);
        return response.data;
    },

    updateAdvice: async (id: number, adviceData: DimensionAdviceUpdateInput): Promise<DimensionAdvice> => {
        const response = await api.put<DimensionAdvice>(`${API.ENDPOINTS.DIMENSIONS}/advices/${id}`, adviceData);
        return response.data;
    },

    deleteAdvice: async (id: number): Promise<void> => {
        await api.delete(`${API.ENDPOINTS.DIMENSIONS}/advices/${id}`);
    },

    calculateScores: async (sessionId: string): Promise<QuizScoreResult> => {
        const response = await api.get<QuizScoreResult>(`${API.ENDPOINTS.DIMENSIONS}/calculate-scores/${sessionId}`);
        return response.data;
    }
};