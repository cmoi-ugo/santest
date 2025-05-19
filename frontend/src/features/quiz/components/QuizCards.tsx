import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '@/features/quiz/api/quizApi';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { sessionApi } from '@/features/quiz/api/sessionApi';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { QuizScoreResult } from '@/features/quiz/types/dimension.types';
import { QuizCardItem } from '@/features/quiz/components/QuizCardItem';
import { Card } from '@/components/ui/Card/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import styles from '@/features/quiz/styles/QuizCards.module.css';
import { ROUTES, MESSAGES, ASSETS } from '@/services/config';

interface QuizResult {
  sessionId: string;
  quiz: Quiz;
  scoreResult: QuizScoreResult;
}

interface QuizCardsProps {
  mode: 'display' | 'manage' | 'results'; 
}

export const QuizCards: React.FC<QuizCardsProps> = ({ mode }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    if (mode === 'results') {
      fetchResults();
    } else {
      fetchQuizzes();
    }
  }, [mode]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizApi.getAll();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError(MESSAGES.ERROR.FORM.QUIZ_LOADING);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const sessionIds = await sessionApi.getAllSessions();
      
      const results: QuizResult[] = [];
      
      for (const sessionId of sessionIds) {
        try {
          const scoreResult = await dimensionApi.calculateScores(sessionId);
          const quiz = await quizApi.getById(scoreResult.quiz_id);
          
          results.push({
            sessionId,
            quiz,
            scoreResult
          });
        } catch (err) {
          console.error(`Erreur lors du chargement des données pour la session ${sessionId}:`, err);
        }
      }
      
      results.sort((a, b) => 
        new Date(b.scoreResult.completion_date).getTime() - 
        new Date(a.scoreResult.completion_date).getTime()
      );
      
      setQuizResults(results);
      setError(null);
    } catch (err) {
      setError("Impossible de charger l'historique des résultats");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    navigate(ROUTES.QUIZ.CREATE);
  };

  const handleDelete = async (id: number | string) => {
    const isConfirmed = await confirm({
      title: 'Confirmation de suppression',
      message: mode === 'manage' 
        ? 'Êtes-vous sûr de vouloir supprimer ce questionnaire ?'
        : 'Êtes-vous sûr de vouloir supprimer ces résultats ?',
      confirmLabel: 'Supprimer',
      destructive: true
    });

    if (isConfirmed) {
      try {
        if (mode === 'manage') {
          await quizApi.delete(id as number);
          setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        } else if (mode === 'results') {
          await sessionApi.deleteSession(id as string);
          setQuizResults(quizResults.filter(result => result.sessionId !== id));
        }
      } catch (err) {
        setError(mode === 'manage' ? MESSAGES.ERROR.FORM.QUIZ_DELETING : 'Erreur lors de la suppression des résultats');
      }
    }
  };

  const handleView = (id: number | string) => {
    if (mode === 'manage') {
      navigate(ROUTES.QUIZ.TAKE_BY_ID(id as number));
    } else if (mode === 'results') {
      navigate(`/results/${id}`);
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

  if ((mode === 'display' && quizzes.length === 0) || 
      (mode === 'results' && quizResults.length === 0)) {
    return (
      <div className={styles.emptyState}>
        {mode === 'display' 
          ? <p>Aucun questionnaire disponible pour le moment.</p>
          : <p>Vous n'avez encore complété aucun questionnaire.</p>
        }
      </div>
    );
  }

  return (
    <div className={styles.quizCards}>
      <div className={styles.cardsGrid}>
        {mode === 'manage' && (
          <Card
            title="Ajouter un questionnaire"
            onClick={handleCreateClick}
            imageClassName={styles.addIconContainer}
            imageUrl={ASSETS.DEFAULT_IMAGES.ADD_ICON}
          />
        )}
        
        {(mode === 'display' || mode === 'manage') && quizzes.map(quiz => (
          <QuizCardItem 
            key={quiz.id}
            quiz={quiz}
            mode={mode}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}

        {mode === 'results' && quizResults.map(result => (
          <QuizCardItem
            key={result.sessionId}
            quiz={result.quiz}
            mode={mode}
            scoreResult={result.scoreResult}
            sessionId={result.sessionId}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}
      </div>
      
      <ConfirmDialog 
        isOpen={isOpen}
        title={options.title || 'Confirmation'}
        message={options.message || 'Êtes-vous sûr ?'}
        confirmLabel={options.confirmLabel}
        cancelLabel={options.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        destructive={options.destructive}
      />
    </div>
  );
};