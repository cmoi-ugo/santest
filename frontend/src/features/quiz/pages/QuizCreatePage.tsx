import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizForm } from '@/features/quiz/components/QuizForm';

const QuizCreatePage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Création d'un questionnaire" />}>
      <QuizForm isEditing={false} />
    </MainLayout>
  );
};

export default QuizCreatePage;