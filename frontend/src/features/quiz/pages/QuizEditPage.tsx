import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizCards } from '@/features/quiz/components/QuizCards';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const QuizEditPage = () => {
  const pageHeader = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        Gestion des Questionnaires
      </h3>
    </div>
  );

  return (
    <MainLayout pageHeader={pageHeader}>
      <QuizCards mode="manage" />
    </MainLayout>
  );
};

export default QuizEditPage;