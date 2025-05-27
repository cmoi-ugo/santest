import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { quizApi } from '@/features/quiz/api/quizApi';
import { questionApi } from '@/features/quiz/api/questionApi';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { Question, SubmitAnswersInput } from '@/features/quiz/types/question.types';
import { QuestionDisplay } from '@/features/quiz/components/interaction/QuestionDisplay/QuestionDisplay';
import styles from './QuizTakePage.module.css';

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
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (id) {
      fetchQuizData();
    }
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setIsLoading(true);
      const quizData = await quizApi.getById(parseInt(id!));
      const questionsData = await questionApi.getAll(parseInt(id!));
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (err) {
      setError(t('quiz.take.errors.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const submitData: SubmitAnswersInput = {
        session_id: sessionId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          question_id: parseInt(questionId),
          value
        }))
      };

      await questionApi.submitAnswers(submitData);
      navigate(`/results/${sessionId}`);
    } catch (err) {
      setError(t('quiz.take.errors.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnsweredAllRequiredQuestions = (targetIndex: number): boolean => {
    for (let i = 0; i <= targetIndex; i++) {
      const question = questions[i];
      if (question && question.required) {
        const answer = answers[question.id];
        
        if (!answer) return false;
        
        // Vérifier que la réponse n'est pas juste des espaces
        if (question.question_type === 'text' && typeof answer === 'string' && answer.trim() === '') {
          return false;
        }
        
        // Vérifier qu'au moins une case est cochée
        if (question.question_type === 'checkbox' && Array.isArray(answer) && answer.length === 0) {
          return false;
        }
      }
    }
    return true;
  };

  const canNavigateToNext = (): boolean => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;

    if (!hasAnsweredAllRequiredQuestions(currentQuestionIndex - 1)) {
      return false;
    }

    if (currentQuestion.required) {
      const answer = answers[currentQuestion.id];
      
      if (!answer) return false;
      
      if (currentQuestion.question_type === 'text' && typeof answer === 'string' && answer.trim() === '') {
        return false;
      }
      
      if (currentQuestion.question_type === 'checkbox' && Array.isArray(answer) && answer.length === 0) {
        return false;
      }
    }

    return true;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1 && canNavigateToNext()) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError(null); 
    } else if (!canNavigateToNext() && questions[currentQuestionIndex].required) {
      setError(t('quiz.take.errors.requiredQuestion'));
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError(null);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingIndicator />
      </MainLayout>
    );
  }

  if (!quiz) {
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
    <MainLayout pageHeader={<PageHeader title={`${quiz.title}`} />}>
      <div className={styles.container}>
        {quiz.image_url && (
          <div className={styles.quizImageContainer}>
            <img 
              src={quiz.image_url}
              alt={quiz.title}
              className={styles.quizImage}
            />
          </div>
        )}

        {quiz.description && (
          <div className={styles.description}>
            {quiz.description}
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {questions.length > 0 && (
          <>
            {(currentQuestion.required) && (
                <div className={styles.requiredText}>
                  {t('quiz.take.requiredIndicator')}
                </div>
              )
            }

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
              <button
                type="button"
                onClick={previousQuestion}
                disabled={isFirstQuestion}
                className={styles.navigationButton}
              >
                {t('quiz.take.navigation.previous')}
              </button>
              
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div className={styles.questionCounter}>
                  {t('quiz.take.progress', { current: currentQuestionIndex + 1, total: questions.length })}
                </div>
              </div>

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={!canNavigateToNext()}
                  className={styles.navigationButton}
                >
                  {t('quiz.take.navigation.next')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !hasAnsweredAllRequiredQuestions(questions.length - 1)}
                  className={styles.submitButton}
                >
                  {isSubmitting ? t('quiz.take.navigation.submitting') : t('quiz.take.navigation.finish')}
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </MainLayout>
  );
};

export default QuizTakePage;