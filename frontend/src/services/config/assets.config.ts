import defaultQuizImage from '@/assets/images/default-quiz.jpg';
import addIcon from '@/assets/images/add.png';

export const ASSETS = {
  IMAGES_BASE_URL: import.meta.env.VITE_IMAGES_URL || './src/assets/images',
  DEFAULT_IMAGES: {
    QUIZ: defaultQuizImage,
    ADD_ICON: addIcon,
  }
};