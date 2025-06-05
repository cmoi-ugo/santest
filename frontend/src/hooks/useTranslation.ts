import { useLanguage } from '@/context/LanguageContext';

/**
 * Hook pour accéder à la fonction de traduction
 */
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};