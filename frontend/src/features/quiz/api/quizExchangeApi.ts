import api from '@/services/api';
import { API } from '@/config';
import { Quiz } from '@/features/quiz/types/quiz.types';

export const quizExchangeApi = {
  exportQuizFile: async (quizId: number, quizTitle: string): Promise<void> => {
    const response = await api.get(`${API.ENDPOINTS.QUIZ_EXCHANGE}/export/${quizId}/download`, {
      responseType: 'blob'
    });
    
    const safeTitle = quizTitle
      .replace(/[^\w\s-]/g, '') // Enlever les caractères spéciaux
      .trim()
      .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
      .toLowerCase();
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${safeTitle}_${dateStr}.json`;
    
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
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