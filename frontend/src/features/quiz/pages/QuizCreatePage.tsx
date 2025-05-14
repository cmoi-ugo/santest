import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { QuizForm } from '@/features/quiz/components/QuizForm';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const QuizCreatePage = () => {
  const pageHeader = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        Création d'un questionnaire
      </h3>
    </div>
  );

  return (
    <MainLayout pageHeader={pageHeader}>
      <QuizForm isEditing={false} />
    </MainLayout>
  );
};

export default QuizCreatePage;