/**
 * Configuration centralisée des routes de l'application
 */
export const ROUTES = {
  HOME: '/',
  
  QUIZ: {
    TAKE: '/quiz/:id',
    TAKE_BY_ID: (id: number | string) => `/quiz/${id}`,
    MANAGE: '/quiz/manage',
    CREATE: '/quiz/create',
    EDIT: '/quiz/:id/edit',
    EDIT_BY_ID: (id: number | string) => `/quiz/${id}/edit`,
    IMPORT: '/quiz/import',
  },
  
  RESULTS: {
    HISTORY: '/results',
    BY_SESSION: '/results/:sessionId',
    BY_SESSION_ID: (sessionId: string) => `/results/${sessionId}`,
  },
  
  FAVORITES: '/favorites',
  SETTINGS: '/settings',
  ABOUT: '/about',
};