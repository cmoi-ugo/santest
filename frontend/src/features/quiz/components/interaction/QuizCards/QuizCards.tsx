import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, ConfirmDialog, ErrorMessage, LoadingIndicator } from '@/components/ui';
import { ASSETS, ROUTES } from '@/config';
import { useConfirm, useTranslation } from '@/hooks';

import { dimensionApi } from '../../../api/dimensionApi';
import { quizApi } from '../../../api/quizApi';
import { sessionApi } from '../../../api/sessionApi';
import type { QuizScoreResult } from '../../../types/dimension.types';
import type { Quiz } from '../../../types/quiz.types';
import { QuizSearchBar } from '../../configuration/QuizSearchBar/QuizSearchBar';
import { QuizTypeFilter } from '../../configuration/QuizTypeFilter/QuizTypeFilter';
import { QuizCardItem } from '../QuizCardItem/QuizCardItem';
import styles from './QuizCards.module.css';

interface QuizResult {
  sessionId: string;
  quiz: Quiz;
  scoreResult: QuizScoreResult;
}

interface QuizCardsProps {
  mode: 'display' | 'manage' | 'results'; 
  showTypeFilter?: boolean;
  showSearchBar?: boolean;
}

/**
 * Composant principal pour afficher les cartes de quiz avec filtrage et gestion
 */
export const QuizCards: React.FC<QuizCardsProps> = ({ 
  mode, 
  showTypeFilter = true,
  showSearchBar = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'results') {
      fetchResults();
    } else {
      fetchQuizzes();
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'results') {
      filterQuizzes();
    }
  }, [selectedTypeId, searchTerm, allQuizzes]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizApi.getAll();
      setAllQuizzes(data);
      setError(null);
    } catch (err) {
      setError(t('errors.form.quizLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = allQuizzes;

    if (selectedTypeId) {
      filtered = filtered.filter(quiz => quiz.quiz_type_id === selectedTypeId);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchLower)
      );
    }

    setQuizzes(filtered);
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
          console.error(`Error loading result for session ${sessionId}:`, err);
        }
      }
      
      results.sort((a, b) => 
        new Date(b.scoreResult.completion_date).getTime() - 
        new Date(a.scoreResult.completion_date).getTime()
      );
      
      setQuizResults(results);
      setError(null);
    } catch (err) {
      setError(t('quiz.cards.errors.loadingResults'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    navigate(ROUTES.QUIZ.CREATE);
  };

  const handleDelete = async (id: number | string) => {
    const isConfirmed = await confirm({
      title: t('quiz.cards.confirmations.deleteTitle'),
      message: mode === 'manage' 
        ? t('quiz.cards.confirmations.deleteQuiz')
        : t('quiz.cards.confirmations.deleteResults'),
      confirmLabel: t('actions.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true
    });

    if (isConfirmed) {
      try {
        if (mode === 'manage') {
          await quizApi.delete(id as number);
          const updatedQuizzes = allQuizzes.filter(quiz => quiz.id !== id);
          setAllQuizzes(updatedQuizzes);
        } else if (mode === 'results') {
          await sessionApi.deleteSession(id as string);
          setQuizResults(prev => prev.filter(result => result.sessionId !== id));
        }
      } catch (err) {
        setError(mode === 'manage' ? t('errors.form.quizDeleting') : t('quiz.cards.errors.deletingResults'));
      }
    }
  };

  const handleView = (id: number | string) => {
    if (mode === 'manage') {
      navigate(ROUTES.QUIZ.TAKE_BY_ID(id as number));
    } else if (mode === 'results') {
      navigate(ROUTES.RESULTS.BY_SESSION_ID(id as string));
    }
  };

  const handleTypeFilterChange = (typeId?: number) => {
    setSelectedTypeId(typeId);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const shouldShowEmptyState = 
    (mode === 'display' && quizzes.length === 0 && !searchTerm && !selectedTypeId) || 
    (mode === 'results' && quizResults.length === 0);

  const hasFiltersApplied = searchTerm || selectedTypeId;
  const showNoResultsMessage = mode !== 'results' && quizzes.length === 0 && hasFiltersApplied;

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className={styles.quizCards}>
      {(showSearchBar || showTypeFilter) && mode !== 'results' && (
        <div className={styles.filtersRow}>
          {showSearchBar && (
            <QuizSearchBar
              searchTerm={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchBar}
            />
          )}
          
          {showTypeFilter && (
            <div className={styles.typeFilterWrapper}>
              <QuizTypeFilter
                selectedTypeId={selectedTypeId}
                onChange={handleTypeFilterChange}
                className={styles.typeFilter}
              />
            </div>
          )}
        </div>
      )}

      {shouldShowEmptyState ? (
        <div className={styles.emptyState}>
          {mode === 'display' 
            ? <p>{t('quiz.cards.emptyStates.noQuizzes')}</p>
            : <p>{t('quiz.cards.emptyStates.noResults')}</p>
          }
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {mode === 'manage' && (
            <Card
              title={t('quiz.cards.addQuiz')}
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
          
          {showNoResultsMessage && (
            <div className={styles.emptyMessage}>
              <p>
                {searchTerm && selectedTypeId 
                  ? t('quiz.cards.emptyStates.noQuizzesSearchAndType', { searchTerm })
                  : searchTerm 
                    ? t('quiz.cards.emptyStates.noQuizzesSearch', { searchTerm })
                    : t('quiz.cards.emptyStates.noQuizzesType')
                }
              </p>
            </div>
          )}
        </div>
      )}
      
      <ConfirmDialog 
        isOpen={isOpen}
        title={options.title || t('common.confirm')}
        message={options.message || t('common.confirm')}
        confirmLabel={options.confirmLabel}
        cancelLabel={options.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        destructive={options.destructive}
      />
    </div>
  );
};