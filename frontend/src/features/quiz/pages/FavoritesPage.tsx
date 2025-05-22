import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { FavoriteQuizCards } from '@/features/quiz/components/FavoriteQuizCards';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const FavoritesPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Mes questionnaires favoris" />}>
      <div className={styles.container}>
        <FavoriteQuizCards />
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;