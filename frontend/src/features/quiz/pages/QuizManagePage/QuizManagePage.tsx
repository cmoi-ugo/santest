import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/interaction/QuizCards/QuizCards';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';

const QuizManagePage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Gestion des Questionnaires" />}>
      <QuizCards mode="manage" />
    </MainLayout>
  );
};

export default QuizManagePage;