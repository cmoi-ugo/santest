import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { FavoriteQuizCards } from '@/features/quiz/components/interaction/FavoriteQuizCards/FavoriteQuizCards';

const FavoritesPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.favorites.title')} />}>
      <FavoriteQuizCards />
    </MainLayout>
  );
};

export default FavoritesPage;