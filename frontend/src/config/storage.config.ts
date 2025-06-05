/**
 * Configuration des clés de stockage local et messages d'erreur
 */
export const STORAGE_KEYS = {
  DARK_MODE: 'darkMode',
  LANGUAGE: 'language',
  FIRST_VISIT: 'santest-first-visit',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'MESSAGES.ERROR.UNAUTHORIZED',
  NOT_FOUND: 'MESSAGES.ERROR.NOT_FOUND',
  SERVER_ERROR: 'MESSAGES.ERROR.SERVER_ERROR',
  NETWORK_ERROR: 'MESSAGES.ERROR.NETWORK_ERROR',
} as const;