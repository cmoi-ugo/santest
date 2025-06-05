import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { QuizCards } from '../../components/interaction/QuizCards/QuizCards';

/**
 * Page d'accueil affichant la liste des quiz disponibles
 */
const HomePage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.home.title')} />}>
      <QuizCards mode="display" />
    </MainLayout>
  );
};

export default HomePage;