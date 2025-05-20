import api from '@/services/api';
import { API } from '@/services/config';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { QuizExport } from '@/features/quiz/types/export.types';

export const quizExchangeApi = {
  // Exporter un questionnaire
  exportQuiz: async (quizId: number): Promise<QuizExport> => {
    const response = await api.get<QuizExport>(`${API.ENDPOINTS.QUIZ_EXCHANGE}/export/${quizId}`);
    return response.data;
  },

  // Importer un questionnaire à partir de données JSON
  importQuizJson: async (quizData: QuizExport): Promise<Quiz> => {
    const response = await api.post<Quiz>(`${API.ENDPOINTS.QUIZ_EXCHANGE}/import-json`, quizData);
    return response.data;
  },

  // Importer un questionnaire à partir d'un fichier
  importQuizFile: async (quizFile: File): Promise<Quiz> => {
    const formData = new FormData();
    formData.append('quiz_file', quizFile);
    
    const response = await api.post<Quiz>(`${API.ENDPOINTS.QUIZ_EXCHANGE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};