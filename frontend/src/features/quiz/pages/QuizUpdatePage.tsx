import { MainLayout } from '@/components/MainLayout/MainLayout';
import { QuizForm } from '@/features/quiz/components/QuizForm';
import styles from '@/features/quiz/components/QuizCards.module.css';

const QuizUpdatePage = () => {
  const pageHeader = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        Modification d'un questionnaire
      </h3>
    </div>
  );

  return (
    <MainLayout pageHeader={pageHeader}>
      <QuizForm isEditing={true} />
    </MainLayout>
  );
};

export default QuizUpdatePage;