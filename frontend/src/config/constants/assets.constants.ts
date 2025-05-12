import defaultQuizImage from '@/assets/images/default-quiz.jpg';

export const ASSETS = {
  IMAGES_BASE_URL: import.meta.env.VITE_IMAGES_URL || '/assets/images',
  DEFAULT_IMAGES: {
    QUIZ: defaultQuizImage
  }
};