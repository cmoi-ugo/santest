import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizCards } from '@/features/quiz/components/interaction/QuizCards/QuizCards';
import styles from '@/features/quiz/components/interaction/QuizCards/QuizCards.module.css';

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