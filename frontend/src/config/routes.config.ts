export const ROUTES = {
  // Page d'accueil - liste des quiz
  HOME: '/',
  
  // Gestion des quiz
  QUIZ: {
    // Consultation publique
    TAKE: '/quiz/:id',
    TAKE_BY_ID: (id: number | string) => `/quiz/${id}`,
    
    // Gestion
    MANAGE: '/quiz/manage',
    CREATE: '/quiz/create',
    EDIT: '/quiz/:id/edit',
    EDIT_BY_ID: (id: number | string) => `/quiz/${id}/edit`,
    IMPORT: '/quiz/import',
  },
  
  // Résultats
  RESULTS: {
    HISTORY: '/results',
    BY_SESSION: '/results/:sessionId',
    BY_SESSION_ID: (sessionId: string) => `/results/${sessionId}`,
  },
  
  // Autres pages
  FAVORITES: '/favorites',
  SETTINGS: '/settings',
  ABOUT: '/about',
};