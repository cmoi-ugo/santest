import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { FavoriteQuizCards } from '../../components/interaction/FavoriteQuizCards/FavoriteQuizCards';

/**
 * Page d'affichage des quiz favoris de l'utilisateur
 */
const FavoritesPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.favorites.title')} />}>
      <FavoriteQuizCards />
    </MainLayout>
  );
};

export default FavoritesPage;