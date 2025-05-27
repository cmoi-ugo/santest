import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { QuizCards } from '@/features/quiz/components/interaction/QuizCards/QuizCards';
import styles from '@/features/quiz/components/interaction/QuizCards/QuizCards.module.css';

const ResultsHistoryPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.resultsHistory.title')} />}>
      <div className={styles.container}>
        <QuizCards mode="results" />
      </div>
    </MainLayout>
  );
};

export default ResultsHistoryPage;