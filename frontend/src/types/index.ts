/**
 * Types communs utilisables dans toute l'application
 */
export interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}