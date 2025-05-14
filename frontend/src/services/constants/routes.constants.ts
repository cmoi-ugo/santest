export const ROUTES = {
  HOME: '/',
  QUIZ: {
    LIST: '/quiz/edit',
    CREATE: '/quiz/create',
    EDIT: '/quiz/edit/:id',
    EDIT_BY_ID: (id: number) => `/quiz/edit/${id}`,
    TAKE: (id: number) => `/quiz/${id}`,
  },
  SETTINGS: '/settings'
};