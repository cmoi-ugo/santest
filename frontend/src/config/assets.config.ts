import addIcon from '@/assets/images/add.svg';
import appSvg from '@/assets/images/app-name.svg';
import defaultQuizImage from '@/assets/images/default-quiz.jpg';
import logo from '@/assets/images/logo.svg';

/**
 * Configuration centralisée des assets statiques
 */
export const ASSETS = {
  LOGO: logo,
  APP_NAME: appSvg,
  IMAGES_BASE_URL: import.meta.env.VITE_IMAGES_URL || './src/assets/images',
  DEFAULT_IMAGES: {
    QUIZ: defaultQuizImage,
    ADD_ICON: addIcon,
  }
};