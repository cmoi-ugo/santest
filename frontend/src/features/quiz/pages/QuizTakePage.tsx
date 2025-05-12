import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout/MainLayout';
import { quizApi } from '@/features/quiz/api/quizApi';
import { questionApi } from '@/features/quiz/api/questionApi';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { Question, SubmitAnswersInput } from '@/features/quiz/types/question.types';
import { QuestionDisplay } from '@/features/quiz/components/QuestionDisplay';
import styles from '@/features/quiz/pages/QuizTakePage.module.css';
import { ROUTES, MESSAGES } from '@/config/constants';
import { getImagePath } from '@/utils/imageUtils';

const QuizTakePage = () => {
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
      setError('Erreur lors du chargement du questionnaire');
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

      const unansweredRequired = questions.filter(q => q.required && !answers[q.id]);
      if (unansweredRequired.length > 0) {
        setError('Veuillez répondre à toutes les questions obligatoires');
        return;
      }

      const submitData: SubmitAnswersInput = {
        session_id: sessionId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          question_id: parseInt(questionId),
          value
        }))
      };

      await questionApi.submitAnswers(submitData);
      navigate(ROUTES.HOME, { state: { message: 'Vos réponses ont été enregistrées avec succès!' } });
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des réponses');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>{MESSAGES.UI.LOADING}</div>
      </MainLayout>
    );
  }

  if (!quiz) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>Questionnaire non trouvé</div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const pageHeader = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        {quiz.title}
      </h3>
    </div>
  );

  return (
    <MainLayout pageHeader={pageHeader}>
      <div className={styles.container}>
        {quiz.image_url && (
          <div className={styles.quizImageContainer}>
            <img 
              src={getImagePath(quiz.image_url)}
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

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {questions.length > 0 && (
          <>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className={styles.questionCounter}>
              Question {currentQuestionIndex + 1} sur {questions.length}
            </div>

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
                Précédent
              </button>

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className={styles.navigationButton}
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Terminer'}
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