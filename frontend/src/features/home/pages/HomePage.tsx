import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/QuizCards';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const HomePage = () => {
  const pageHeader = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        Questionnaires récents
      </h3>
    </div>
  );

  return (
    <MainLayout pageHeader={pageHeader}>
      <div className={styles.container}>
        <QuizCards mode="display" />
      </div>
    </MainLayout>
  );
};

export default HomePage;