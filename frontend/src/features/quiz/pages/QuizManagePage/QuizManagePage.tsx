import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/interaction/QuizCards/QuizCards';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';

const QuizManagePage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizManage.title')} />}>
      <QuizCards mode="manage" />
    </MainLayout>
  );
};

export default QuizManagePage;