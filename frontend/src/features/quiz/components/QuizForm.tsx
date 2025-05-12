import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi } from '@/features/quiz/api/quizApi';
import { questionApi } from '@/features/quiz/api/questionApi';
import { QuizCreateInput, QuizUpdateInput } from '@/features/quiz/types/quiz.types';
import { Question } from '@/features/quiz/types/question.types';
import { QuestionItem } from '@/features/quiz/components/QuestionItem';
import { QuestionEditor } from '@/features/quiz/components/QuestionEditor';
import styles from '@/features/quiz/components/QuizForm.module.css';
import { ROUTES, MESSAGES } from '@/config/constants';
import { MdAdd } from 'react-icons/md';

interface QuizFormProps {
  isEditing?: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuizCreateInput>({
    title: '',
    description: '',
    image_url: ''
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewQuestionEditor, setShowNewQuestionEditor] = useState(false);
  const quizId = id ? parseInt(id) : 0;

  useEffect(() => {
    if (isEditing && id) {
      const fetchQuizData = async () => {
        try {
          setIsLoading(true);
          const quiz = await quizApi.getById(parseInt(id));
          setFormData({
            title: quiz.title,
            description: quiz.description || '',
            image_url: quiz.image_url || ''
          });
          
          const quizQuestions = await questionApi.getAll(parseInt(id));
          setQuestions(quizQuestions);
        } catch (err) {
          setError(MESSAGES.ERROR.FORM.QUIZ_LOADING);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuizData();
    }
  }, [isEditing, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (isEditing && id) {
        const updateData: QuizUpdateInput = {};
        if (formData.title !== undefined) updateData.title = formData.title;
        if (formData.description !== undefined) updateData.description = formData.description;
        if (formData.image_url !== undefined) updateData.image_url = formData.image_url;
        
        await quizApi.update(parseInt(id), updateData);
      } else {
        const newQuiz = await quizApi.create(formData);
        navigate(ROUTES.QUIZ.EDIT_BY_ID(newQuiz.id));
        return;
      }
      
      navigate(ROUTES.QUIZ.LIST);
    } catch (err) {
      setError(MESSAGES.ERROR.FORM.QUIZ_SAVING);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setShowNewQuestionEditor(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await questionApi.delete(questionId);
        setQuestions(questions.filter(q => q.id !== questionId));
      } catch (err) {
        setError('Erreur lors de la suppression de la question');
      }
    }
  };

  const handleSaveNewQuestion = async (questionData: Partial<Question>) => {
    try {
      const newQuestion = await questionApi.create({
        quiz_id: quizId,
        text: questionData.text!,
        question_type: questionData.question_type!,
        options: questionData.options,
        required: questionData.required,
        order: questions.length
      });
      setQuestions([...questions, newQuestion]);
      setShowNewQuestionEditor(false);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la question');
    }
  };

  const handleSaveExistingQuestion = async (questionData: Partial<Question>) => {
    try {
      const updated = await questionApi.update(questionData.id!, {
        text: questionData.text,
        question_type: questionData.question_type,
        options: questionData.options,
        required: questionData.required
      });
      setQuestions(questions.map(q => q.id === updated.id ? updated : q));
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la question');
    }
  };

  const handleCancelNewQuestion = () => {
    setShowNewQuestionEditor(false);
  };

  if (isLoading && isEditing) return <div>{MESSAGES.UI.LOADING}</div>;

  return (
    <div className={styles.formContainer}>
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.compactForm}>
        
        <div className={styles.formFields}>
          {formData.image_url && (
            <div className={styles.imagePreview}>
              <img 
                src={formData.image_url} 
                alt="Aperçu" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  setError(MESSAGES.ERROR.FORM.INVALID_IMAGE_URL);
                }}
                onLoad={() => {
                  setError(null);
                }}
              />
            </div>
          )}
          <div className={styles.fieldRow}>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={255}
              placeholder="Titre du questionnaire"
            />
          </div>
          
          <div className={styles.fieldRow}>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du questionnaire"
            />
          </div>

          <div className={styles.fieldRow}>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleChange}
              placeholder="Lien de l'image"
            />
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={() => navigate(ROUTES.QUIZ.LIST)}
            className={styles.cancelButton}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Enregistrement ...' : (isEditing ? 'Enregistrer' : 'Créer')}
          </button>
        </div>
      </form>

      {isEditing && quizId > 0 && (
        <>
          <div className={styles.questionsSection}>
            <div className={styles.questionsSectionHeader}>
              <h3>Questions</h3>
              {!showNewQuestionEditor && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className={styles.addQuestionButton}
                >
                  <MdAdd /> Ajouter une question
                </button>
              )}
            </div>

            {showNewQuestionEditor && (
              <QuestionEditor
                quizId={quizId}
                question={null}
                onSave={handleSaveNewQuestion}
                onCancel={handleCancelNewQuestion}
              />
            )}

            <div className={styles.questionsList}>
              {questions.length === 0 && !showNewQuestionEditor ? (
                <p className={styles.noQuestions}>Aucune question pour le moment</p>
              ) : (
                questions.map((question, index) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    index={index}
                    onDelete={handleDeleteQuestion}
                    onSave={handleSaveExistingQuestion}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};