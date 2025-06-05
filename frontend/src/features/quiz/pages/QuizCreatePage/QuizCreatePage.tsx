import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { QuizForm } from '../../components/editors/QuizForm/QuizForm';

/**
 * Page de création d'un nouveau quiz
 */
const QuizCreatePage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizCreate.title')} />}>
      <QuizForm isEditing={false} />
    </MainLayout>
  );
};

export default QuizCreatePage;