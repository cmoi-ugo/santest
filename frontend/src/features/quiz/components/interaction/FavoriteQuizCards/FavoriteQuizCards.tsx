import { useEffect, useState } from 'react';

import { ErrorMessage, LoadingIndicator } from '@/components/ui';
import { useTranslation } from '@/hooks';

import { favoriteApi } from '../../../api/favoriteApi';
import { quizApi } from '../../../api/quizApi';
import type { Quiz } from '../../../types/quiz.types';
import { QuizCardItem } from '../QuizCardItem/QuizCardItem';
import styles from '../QuizCards/QuizCards.module.css';

/**
 * Affiche la liste des quiz favoris avec possibilité de les retirer des favoris
 */
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