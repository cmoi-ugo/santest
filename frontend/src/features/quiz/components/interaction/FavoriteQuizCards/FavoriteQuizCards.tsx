import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import { favoriteApi } from '@/features/quiz/api/favoriteApi';
import { quizApi } from '@/features/quiz/api/quizApi';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { QuizCardItem } from '@/features/quiz/components/interaction/QuizCardItem/QuizCardItem';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import styles from '@/features/quiz/components/interaction/QuizCards/QuizCards.module.css';

export const FavoriteQuizCards: React.FC = () => {
  const { t } = useTranslation();
  const [favoriteQuizzes, setFavoriteQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavoriteQuizzes();
  }, []);

  const fetchFavoriteQuizzes = async () => {
    try {
      setIsLoading(true);
      
      const favorites = await favoriteApi.getAll();
      const quizPromises = favorites.map(favorite => 
        quizApi.getById(favorite.quiz_id)
      );
      
      const quizzes = await Promise.all(quizPromises);
      setFavoriteQuizzes(quizzes);
      setError(null);
    } catch (err) {
      setError(t('quiz.cards.errors.loadingFavorites'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (quizId: number) => {
    try {
      setFavoriteQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    } catch (err) {
      setError(t('quiz.cards.errors.removingFavorite'));
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

  if (favoriteQuizzes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{t('quiz.cards.emptyStates.noFavorites')}</p>
        <p>{t('quiz.cards.emptyStates.favoritesHint')}</p>
      </div>
    );
  }

  return (
    <div className={styles.quizCards}>
      <div className={styles.cardsGrid}>
        {favoriteQuizzes.map(quiz => (
          <QuizCardItem 
            key={quiz.id}
            quiz={quiz}
            mode="display"
            onFavoriteChange={() => handleRemoveFromFavorites(quiz.id)}
          />
        ))}
      </div>
    </div>
  );
};