import api from '@/services/api';
import { ResetPreview, ResetResult } from '@/features/settings/types/reset.types';

export const resetApi = {
  // Obtenir l'aperçu de la réinitialisation
  getPreview: async (): Promise<ResetPreview> => {
    const response = await api.get<ResetPreview>('/admin/reset/preview');
    return response.data;
  },

  // Exécuter la réinitialisation
  executeReset: async (): Promise<ResetResult> => {
    const response = await api.post<ResetResult>('/admin/reset?confirm_reset=true');
    return response.data;
  }
};