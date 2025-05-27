import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/interaction/QuizCards/QuizCards';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';

const HomePage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.home.title')} />}>
      <QuizCards mode="display" />
    </MainLayout>
  );
};

export default HomePage;