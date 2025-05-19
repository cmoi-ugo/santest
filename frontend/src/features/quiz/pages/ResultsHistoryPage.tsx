import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizCards } from '@/features/quiz/components/QuizCards';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const ResultsHistoryPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Historique de vos résultats" />}>
      <div className={styles.container}>
        <QuizCards mode="results" />
      </div>
    </MainLayout>
  );
};

export default ResultsHistoryPage;