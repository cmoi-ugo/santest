import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { ScoreBar, ScoreSeverity } from '@/components/ui/ScoreBar/ScoreBar';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { quizApi } from '@/features/quiz/api/quizApi';
import { QuizScoreResult } from '@/features/quiz/types/dimension.types';
import { Quiz } from '@/features/quiz/types/quiz.types';
import styles from '@/features/quiz/styles/QuizResultPage.module.css';
import { ROUTES } from '@/services/config';

const QuizResultPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [scoreResult, setScoreResult] = useState<QuizScoreResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const result = await dimensionApi.calculateScores(sessionId!);
      setScoreResult(result);
      
      const quizData = await quizApi.getById(result.quiz_id);
      setQuiz(quizData);
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des résultats');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'info': return styles.scoreInfo;
      case 'warning': return styles.scoreWarning;
      case 'danger': return styles.scoreDanger;
      default: return styles.scoreInfo;
    }
  };

  const mapSeverity = (severity: string): ScoreSeverity => {
    switch (severity) {
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      default: return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingIndicator />
      </MainLayout>
    );
  }

  if (!scoreResult || !quiz) {
    return (
      <MainLayout>
        <ErrorMessage message="Résultats non disponibles" />
      </MainLayout>
    );
  }

  return (
    <MainLayout pageHeader={<PageHeader title={`Résultats: ${quiz.title}`} />}>
      <div className={styles.container}>
        {error && <ErrorMessage message={error} />}
        
        <div className={styles.resultSummary}>
          <p className={styles.completionDate}>
            Complété le {formatDate(scoreResult.completion_date)}
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
                <h3 className={styles.dimensionName}>{score.dimension_name}</h3>
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
                  {score.score} / {score.max_score} points
                </div>
              </div>
              
              {score.advice && (
                <div 
                  className={`${styles.adviceContainer} ${getSeverityClass(score.advice.severity)}`}
                >
                  <h4 className={styles.adviceTitle}>{score.advice.title}</h4>
                  <p className={styles.adviceText}>{score.advice.advice}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={() => navigate(ROUTES.HOME)}
            className={styles.backButton}
          >
            Retour à l'accueil
          </button>
          <button 
            onClick={() => navigate(ROUTES.QUIZ.TAKE_BY_ID(quiz.id))}
            className={styles.retakeButton}
          >
            Refaire ce questionnaire
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResultPage;