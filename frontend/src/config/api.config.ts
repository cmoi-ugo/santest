export const API = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  API_PATH: '/api',
  ENDPOINTS: {
    QUIZZES: '/quizzes',
    QUESTIONS: '/questions',
    ANSWERS: '/answers',
    DIMENSIONS: '/dimensions',
    QUIZ_EXCHANGE: '/quiz-exchange',
    FAVORITES: '/favorites',
    QUIZ_TYPES: '/quiz-types',
  },
  TIMEOUTS: {
    REQUEST: 30000, // 30 secondes
    RETRY: 5000 // 5 secondes
  },
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json'
  }
};