/**
 * Configuration des éléments d'interface utilisateur
 */
export const UI = {
  ICONS: {
    SIZE: {
      MICRO: 8,
      SMALL: 20,
      MEDIUM: 24,
      LARGE: 28
    }
  },
  COLORS: {
    DANGER: '#dc3545',
    SEVERITY_INFO: '#2196F3',
    SEVERITY_WARNING: '#FF9800',
    SEVERITY_DANGER: '#F44336',
  },
  LIMITS: {
    QUIZ_TITLE_MIN_LENGTH: 3,
    QUIZ_TITLE_MAX_LENGTH: 255,
    QUIZ_DESCRIPTION_MAX_LENGTH: 1000,
    SCALE_MIN_VALUE: 1,
    SCALE_MAX_VALUE: 10,
    SCALE_MAX_RANGE: 9,
    IMAGE_URL_MAX_LENGTH: 2000,
    PREVIEW_MAX_HEIGHT: 200,
    QUIZ_TYPE_NAME_MAX_LENGTH: 100,
  },
  TIMEOUTS: {
    SUCCESS_MESSAGE: 3000,
    SEARCH_DEBOUNCE: 300,
    SCROLL_CHECK: 300,
    BLOB_CLEANUP: 100,
  },
  SCROLL: {
    AMOUNT: 250,
  },
  EXTERNAL_LINKS: {
    DOCUMENTATION: 'https://cmoi-ugo.github.io/santest/',
  },
  LOCALE: {
    DEFAULT: 'fr-FR',
    DATE_FORMAT_OPTIONS: {
      day: 'numeric' as const,
      month: 'short' as const,
      year: 'numeric' as const
    }
  }
};