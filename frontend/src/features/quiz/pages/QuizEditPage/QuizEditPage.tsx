import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizForm } from '@/features/quiz/components/editors/QuizForm/QuizForm';

const QuizEditPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizEdit.title')} />}>
      <QuizForm isEditing={true} />
    </MainLayout>
  );
};

export default QuizEditPage;