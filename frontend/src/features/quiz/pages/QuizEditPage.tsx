import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizForm } from '@/features/quiz/components/QuizForm';

const QuizEditPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Modification d'un questionnaire" />}>
      <QuizForm isEditing={true} />
    </MainLayout>
  );
};

export default QuizEditPage;