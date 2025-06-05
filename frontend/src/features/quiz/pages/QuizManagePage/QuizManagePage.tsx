import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { QuizCards } from '../../components/interaction/QuizCards/QuizCards';

/**
 * Page de gestion des quiz avec options d'édition et suppression
 */
const QuizManagePage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizManage.title')} />}>
      <QuizCards mode="manage" />
    </MainLayout>
  );
};

export default QuizManagePage;