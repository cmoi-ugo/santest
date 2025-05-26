import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/interaction/QuizCards/QuizCards';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';

const HomePage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Questionnaires récents" />}>
      <QuizCards mode="display" />
    </MainLayout>
  );
};

export default HomePage;