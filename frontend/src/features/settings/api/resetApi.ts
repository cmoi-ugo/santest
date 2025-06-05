import api from '@/services/api';

import type { ResetPreview, ResetResult } from '../types/reset.types';

/**
 * API pour la gestion de la réinitialisation de l'application
 */
export const resetApi = {
  /**
   * Obtient l'aperçu des éléments qui seront supprimés lors de la réinitialisation
   */
  getPreview: async (): Promise<ResetPreview> => {
    const response = await api.get<ResetPreview>('/admin/reset/preview');
    return response.data;
  },

  /**
   * Exécute la réinitialisation complète de l'application
   */
  executeReset: async (): Promise<ResetResult> => {
    const response = await api.post<ResetResult>('/admin/reset?confirm_reset=true');
    return response.data;
  }
};