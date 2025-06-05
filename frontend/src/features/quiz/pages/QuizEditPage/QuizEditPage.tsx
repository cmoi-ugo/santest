import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { QuizForm } from '../../components/editors/QuizForm/QuizForm';

/**
 * Page d'édition d'un quiz existant avec onglets pour questions et dimensions
 */
const QuizEditPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizEdit.title')} />}>
      <QuizForm isEditing={true} />
    </MainLayout>
  );
};

export default QuizEditPage;