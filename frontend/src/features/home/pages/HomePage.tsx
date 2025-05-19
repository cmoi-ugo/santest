import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/QuizCards';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const HomePage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Questionnaires récents" />}>
      <div className={styles.container}>
        <QuizCards mode="display" />
      </div>
    </MainLayout>
  );
};

export default HomePage;