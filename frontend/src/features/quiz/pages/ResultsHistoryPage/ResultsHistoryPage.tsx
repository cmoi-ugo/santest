import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { QuizCards } from '../../components/interaction/QuizCards/QuizCards';

/**
 * Page d'historique des résultats de quiz avec possibilité de consultation et suppression
 */
const ResultsHistoryPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout 
      pageHeader={<PageHeader title={t('pages.resultsHistory.title')} />}
    >
      <QuizCards 
        mode="results" 
        showTypeFilter={false} 
        showSearchBar={false} 
      />
    </MainLayout>
  );
};

export default ResultsHistoryPage;