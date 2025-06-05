import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, ErrorMessage, LoadingIndicator, PageHeader, ScoreBar } from '@/components/ui';
import { ROUTES } from '@/config';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { questionApi } from '../../api/questionApi';
import { quizApi } from '../../api/quizApi';
import { QuestionDisplay } from '../../components/interaction/QuestionDisplay/QuestionDisplay';
import type { Question, SubmitAnswersInput } from '../../types/question.types';
import type { Quiz } from '../../types/quiz.types';
import styles from './QuizTakePage.module.css';

/**
 * Génère un identifiant de session unique
 */
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `session_${timestamp}_${random}`;
};

/**
 * Vérifie si une réponse est valide pour une question donnée
 */
const isValidAnswer = (question: Question, answer: any): boolean => {
  if (!answer) return false;
  
  switch (question.question_type) {
    case 'text':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'checkbox':
      return Array.isArray(answer) && answer.length > 0;
    default:
      return Boolean(answer);
  }
};

/**
 * Page de prise de quiz avec navigation question par question et validation
 */
const QuizTakePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId] = useState(generateSessionId);

  useEffect(() => {
    if (id) {
      fetchQuizData(parseInt(id, 10));
    } else {
      setError(t('quiz.take.errors.invalidQuizId'));
      setIsLoading(false);
    }
  }, [id]);

  const fetchQuizData = async (quizId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [quizData, questionsData] = await Promise.all([
        quizApi.getById(quizId),
        questionApi.getAll(quizId)
      ]);
      
      setQuiz(quizData);
      setQuestions(questionsData);
      
      if (questionsData.length === 0) {
        setError(t('quiz.take.errors.noQuestions'));
      }
    } catch (err) {
      setError(t('quiz.take.errors.loadingError'));
      console.error('Failed to fetch quiz data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmitQuiz()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const submitData: SubmitAnswersInput = {
        session_id: sessionId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          question_id: parseInt(questionId, 10),
          value
        }))
      };

      await questionApi.submitAnswers(submitData);
      navigate(ROUTES.RESULTS.BY_SESSION_ID(sessionId));
    } catch (err) {
      setError(t('quiz.take.errors.submitError'));
      console.error('Failed to submit answers:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnsweredRequiredQuestions = (upToIndex: number): boolean => {
    for (let i = 0; i <= upToIndex; i++) {
      const question = questions[i];
      if (question?.required) {
        const answer = answers[question.id];
        if (!isValidAnswer(question, answer)) {
          return false;
        }
      }
    }
    return true;
  };

  const canNavigateToNext = (): boolean => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;

    if (!hasAnsweredRequiredQuestions(currentQuestionIndex - 1)) {
      return false;
    }

    if (currentQuestion.required) {
      const answer = answers[currentQuestion.id];
      return isValidAnswer(currentQuestion, answer);
    }

    return true;
  };

  const canSubmitQuiz = (): boolean => {
    return hasAnsweredRequiredQuestions(questions.length - 1);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) return;
    
    if (canNavigateToNext()) {
      setCurrentQuestionIndex(prev => prev + 1);
      setError(null);
    } else {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion?.required) {
        setError(t('quiz.take.errors.requiredQuestion'));
      }
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setError(null);
    }
  };

  const getProgressPercentage = (): number => {
    if (questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingIndicator message={t('quiz.take.loading')} />
      </MainLayout>
    );
  }

  if (error && !quiz) {
    return (
      <MainLayout>
        <ErrorMessage message={error} />
      </MainLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <MainLayout>
        <ErrorMessage message={t('quiz.take.errors.quizNotFound')} />
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <MainLayout pageHeader={<PageHeader title={quiz.title} />}>
      <div className={styles.container}>
        {quiz.image_url && (
          <div className={styles.quizImageContainer}>
            <img 
              src={quiz.image_url}
              alt={quiz.title}
              className={styles.quizImage}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        )}

        {quiz.description && (
          <div className={styles.description}>
            {quiz.description}
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {currentQuestion.required && (
          <div className={styles.requiredText}>
            {t('quiz.take.requiredIndicator')}
          </div>
        )}

        <div className={styles.questionsContainer}>
          <QuestionDisplay
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentQuestionIndex}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          />
        </div>

        <div className={styles.navigationActions}>
          <Button
            variant="text"
            onClick={previousQuestion}
            disabled={isFirstQuestion}
            className={styles.navigationButton}
          >
            {t('quiz.take.navigation.previous')}
          </Button>
          
          <div className={styles.progress}>
            <ScoreBar 
              percentage={getProgressPercentage()}
              severity="info"
              className={styles.progressBar}
            />
            <div className={styles.questionCounter}>
              {t('quiz.take.progress', { 
                current: currentQuestionIndex + 1, 
                total: questions.length 
              })}
            </div>
          </div>

          {!isLastQuestion ? (
            <Button
              variant="primary"
              onClick={nextQuestion}
              disabled={!canNavigateToNext()}
              className={styles.navigationButton}
            >
              {t('quiz.take.navigation.next')}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmitQuiz()}
              loading={isSubmitting}
              className={styles.submitButton}
            >
              {t('quiz.take.navigation.finish')}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizTakePage;