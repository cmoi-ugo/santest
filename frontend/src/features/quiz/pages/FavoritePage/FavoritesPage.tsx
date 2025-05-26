import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { FavoriteQuizCards } from '@/features/quiz/components/interaction/FavoriteQuizCards/FavoriteQuizCards';

const FavoritesPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Mes questionnaires favoris" />}>
      <FavoriteQuizCards />
    </MainLayout>
  );
};

export default FavoritesPage;