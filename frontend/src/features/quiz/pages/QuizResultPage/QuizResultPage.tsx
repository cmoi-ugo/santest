import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, ErrorMessage, LoadingIndicator, PageHeader, ScoreBar } from '@/components/ui';
import type { ScoreSeverity } from '@/components/ui';
import { ROUTES, UI } from '@/config';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { dimensionApi } from '../../api/dimensionApi';
import { quizApi } from '../../api/quizApi';
import type { QuizScoreResult } from '../../types/dimension.types';
import type { Quiz } from '../../types/quiz.types';
import styles from './QuizResultPage.module.css';

/**
 * Mappe la sévérité des conseils vers les types de ScoreBar
 */
const mapSeverity = (severity: string): ScoreSeverity => {
  switch (severity) {
    case 'warning': return 'warning';
    case 'danger': return 'danger';
    default: return 'info';
  }
};

/**
 * Retourne la classe CSS correspondant à la sévérité
 */
const getSeverityClass = (severity: string): string => {
  switch (severity) {
    case 'info': return styles.scoreInfo;
    case 'warning': return styles.scoreWarning;
    case 'danger': return styles.scoreDanger;
    default: return styles.scoreInfo;
  }
};

/**
 * Page d'affichage des résultats détaillés d'un quiz avec scores par dimension
 */
const QuizResultPage = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [scoreResult, setScoreResult] = useState<QuizScoreResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchResults();
    } else {
      setError(t('quiz.results.missingSessionId'));
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchResults = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const [result, quizData] = await Promise.all([
        dimensionApi.calculateScores(sessionId),
        dimensionApi.calculateScores(sessionId).then(r => quizApi.getById(r.quiz_id))
      ]);
      
      setScoreResult(result);
      setQuiz(quizData);
    } catch (err) {
      setError(t('quiz.results.loadingError'));
      console.error('Failed to fetch quiz results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return t('common.unknownDate');
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(UI.LOCALE.DEFAULT, UI.LOCALE.DATE_FORMAT_OPTIONS);
    } catch (err) {
      return t('common.unknownDate');
    }
  };

  const handleBackToHome = () => {
    navigate(ROUTES.HOME);
  };

  const handleRetakeQuiz = () => {
    if (quiz) {
      navigate(ROUTES.QUIZ.TAKE_BY_ID(quiz.id));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingIndicator message={t('quiz.results.loading')} />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorMessage message={error} />
      </MainLayout>
    );
  }

  if (!scoreResult || !quiz) {
    return (
      <MainLayout>
        <ErrorMessage message={t('quiz.results.resultsNotAvailable')} />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      pageHeader={
        <PageHeader title={t('quiz.results.title', { quizTitle: quiz.title })} />
      }
    >
      <div className={styles.container}>
        <div className={styles.resultSummary}>
          <p className={styles.completionDate}>
            {t('quiz.results.completedOn', { 
              date: formatDate(scoreResult.completion_date) 
            })}
          </p>
          
          {quiz.description && (
            <div className={styles.quizDescription}>
              {quiz.description}
            </div>
          )}
        </div>

        <div className={styles.dimensionsGrid}>
          {scoreResult.dimension_scores.map((score) => (
            <div key={score.dimension_id} className={styles.dimensionCard}>
              <div className={styles.dimensionHeader}>
                <h3 className={styles.dimensionName}>
                  {score.dimension_name}
                </h3>
                <div 
                  className={`${styles.scorePercentage} ${
                    score.advice ? getSeverityClass(score.advice.severity) : styles.scoreInfo
                  }`}
                >
                  {Math.round(score.percentage)}%
                </div>
              </div>
              
              <div className={styles.scoreProgress}>
                <ScoreBar 
                  percentage={score.percentage}
                  severity={score.advice ? mapSeverity(score.advice.severity) : 'info'}
                  className={styles.progressBar}
                />
                <div className={styles.scoreValues}>
                  {t('quiz.results.points', { 
                    score: score.score, 
                    maxScore: score.max_score 
                  })}
                </div>
              </div>
              
              {score.advice && (
                <div 
                  className={`${styles.adviceContainer} ${getSeverityClass(score.advice.severity)}`}
                >
                  <h4 className={styles.adviceTitle}>
                    {score.advice.title}
                  </h4>
                  <p className={styles.adviceText}>
                    {score.advice.advice}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className={styles.actions}>
          <Button 
            variant="text"
            onClick={handleBackToHome}
          >
            {t('quiz.results.actions.backToHome')}
          </Button>
          
          <Button 
            variant="primary"
            onClick={handleRetakeQuiz}
          >
            {t('quiz.results.actions.retake')}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResultPage;