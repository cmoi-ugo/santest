export const ROUTES = {
  HOME: '/',
  QUIZ: {
    LIST: '/quiz/edit',
    CREATE: '/quiz/create',
    EDIT: '/quiz/edit/:id',
    EDIT_BY_ID: (id: number | string) => `/quiz/edit/${id}`,
    TAKE: '/quiz/:id',
    TAKE_BY_ID: (id: number | string) => `/quiz/${id}`,
  },
  RESULTS: {
    HISTORY: '/results',
    BY_SESSION: '/results/:sessionId',
    BY_SESSION_ID: (sessionId: string) => `/results/${sessionId}`
  },
  SETTINGS: '/settings'
};