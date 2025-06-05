import api from '@/services/api';
import { API, UI } from '@/config';

import type { Quiz } from '../types/quiz.types';

/**
 * Nettoie un titre pour créer un nom de fichier sûr
 */
const createSafeFilename = (title: string): string => {
    return title
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();
};

/**
 * Crée un nom de fichier avec date pour l'export
 */
const createExportFilename = (title: string): string => {
    const safeTitle = createSafeFilename(title);
    const dateStr = new Date().toISOString().split('T')[0];
    return `${safeTitle}_${dateStr}.json`;
};

/**
 * Déclenche le téléchargement d'un fichier blob
 */
const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }, UI.TIMEOUTS?.BLOB_CLEANUP || 100);
};

/**
 * API pour l'import/export de quiz
 */
export const quizExchangeApi = {
    /**
     * Exporte un quiz en fichier JSON téléchargeable
     */
    exportQuizFile: async (quizId: number, quizTitle: string): Promise<void> => {
        const response = await api.get(`${API.ENDPOINTS.QUIZ_EXCHANGE}/export/${quizId}/download`, {
            responseType: 'blob'
        });
        
        const filename = createExportFilename(quizTitle);
        const blob = new Blob([response.data], { type: 'application/json' });
        
        downloadBlob(blob, filename);
    },

    /**
     * Importe un quiz depuis un fichier JSON
     */
    importQuizFile: async (quizFile: File): Promise<Quiz> => {
        const formData = new FormData();
        formData.append('quiz_file', quizFile);
        
        const response = await api.post<Quiz>(`${API.ENDPOINTS.QUIZ_EXCHANGE}/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json; charset=utf-8',
            },
        });
        
        return response.data;
    },
};