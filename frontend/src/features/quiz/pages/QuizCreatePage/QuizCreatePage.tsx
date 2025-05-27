import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizForm } from '@/features/quiz/components/editors/QuizForm/QuizForm';

const QuizCreatePage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizCreate.title')} />}>
      <QuizForm isEditing={false} />
    </MainLayout>
  );
};

export default QuizCreatePage;