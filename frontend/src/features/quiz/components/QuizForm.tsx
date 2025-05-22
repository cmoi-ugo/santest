import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi } from '@/features/quiz/api/quizApi';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { QuizCreateInput, QuizUpdateInput } from '@/features/quiz/types/quiz.types';
import { Dimension } from '@/features/quiz/types/dimension.types';
import { DimensionManager } from '@/features/quiz/components/DimensionManager';
import { QuestionManager } from '@/features/quiz/components/QuestionManager';
import { QuizTypeSelector } from '@/features/quiz/components/QuizTypeSelector';
import { TabContainer, Tab } from '@/components/ui/TabContainer/TabContainer';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import styles from '@/features/quiz/styles/QuizForm.module.css';
import { ROUTES, MESSAGES } from '@/services/config';

interface QuizFormProps {
  isEditing?: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuizCreateInput>({
    title: '',
    description: '',
    image_url: '',
    quiz_type_id: undefined
  });
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            image_url: quiz.image_url || '',
            quiz_type_id: quiz.quiz_type_id || undefined
          });
          
          const quizDimensions = await dimensionApi.getAll(parseInt(id));
          setDimensions(quizDimensions);
        } catch (err) {
          setError(MESSAGES.ERROR.FORM.QUIZ_LOADING);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuizData();
    }
  }, [isEditing, id]);

  const handleDimensionsUpdate = (updatedDimensions: Dimension[]) => {
    setDimensions(updatedDimensions);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeIdChange = (selectedId?: number) => {
    setFormData({
      ...formData,
      quiz_type_id: selectedId
    });
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
        updateData.quiz_type_id = formData.quiz_type_id;
        
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

  if (isLoading && isEditing) return <LoadingIndicator />;

  const renderQuizForm = () => (
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
        
        <FormField required>
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
        </FormField>
        
        <FormField>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description du questionnaire"
          />
        </FormField>

        <FormField>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url || ''}
            onChange={handleChange}
            placeholder="Lien de l'image"
          />
        </FormField>

        <QuizTypeSelector
          selectedTypeId={formData.quiz_type_id}
          onChange={handleTypeIdChange}
          disabled={isLoading}
        />
      </div>
      
      <div className={styles.formActions}>
        <Button 
          variant="text" 
          onClick={() => navigate(ROUTES.QUIZ.LIST)}
          type="button"
        >
          Annuler
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          loading={isLoading}
        >
          {isEditing ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  );

  if (!isEditing) {
    return (
      <div className={styles.formContainer}>
        {error && <ErrorMessage message={error} />}
        {renderQuizForm()}
      </div>
    );
  }

  const tabs: Tab[] = [
    {
      id: 'quiz',
      label: 'Questionnaire',
      content: renderQuizForm()
    },
    {
      id: 'questions',
      label: 'Questions',
      content: <QuestionManager quizId={quizId} dimensions={dimensions} />
    },
    {
      id: 'dimensions',
      label: 'Dimensions',
      content: (
        <DimensionManager 
          quizId={quizId} 
          dimensions={dimensions}
          onDimensionsUpdate={handleDimensionsUpdate}
        />
      )
    }
  ];

  return (
    <div className={styles.formContainer}>
      {error && <ErrorMessage message={error} />}
      <TabContainer tabs={tabs} defaultActiveTab="quiz" />
    </div>
  );
};