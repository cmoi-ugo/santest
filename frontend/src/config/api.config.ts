/**
 * Configuration centralisée de l'API
 */
export const API = {
  BASE_URL: 'http://localhost:8000',
  API_PATH: '/api',
  ENDPOINTS: {
    QUIZZES: '/quizzes',
    QUESTIONS: '/questions',
    ANSWERS: '/answers',
    DIMENSIONS: '/dimensions',
    QUIZ_TYPES: '/quiz-types',
    QUIZ_EXCHANGE: '/quiz-exchange',
    FAVORITES: '/favorites',
  },
  TIMEOUTS: {
    REQUEST: 30000,
    RETRY: 5000
  },
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json'
  }
};