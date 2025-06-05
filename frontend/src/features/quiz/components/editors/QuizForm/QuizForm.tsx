import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { 
  Button, 
  ErrorMessage, 
  FormField, 
  ImageUrlField, 
  LoadingIndicator, 
  TabContainer, 
  useImageUrlField 
} from '@/components/ui';
import type { Tab } from '@/components/ui';
import { ROUTES, UI } from '@/config';
import { useTranslation } from '@/hooks';

import { dimensionApi } from '../../../api/dimensionApi';
import { quizApi } from '../../../api/quizApi';
import { QuizTypeSelector } from '../../configuration/QuizTypeSelector/QuizTypeSelector';
import type { Dimension } from '../../../types/dimension.types';
import type { QuizCreateInput, QuizUpdateInput } from '../../../types/quiz.types';
import { DimensionManager } from '../DimensionManager/DimensionManager';
import { QuestionManager } from '../QuestionManager/QuestionManager';
import styles from './QuizForm.module.css';

interface QuizFormProps {
  isEditing?: boolean;
}

interface QuizFormData {
  title: string;
  description: string;
  quiz_type_id?: number;
}

/**
 * Formulaire de création et édition de quiz avec onglets pour questions et dimensions
 */
export const QuizForm: React.FC<QuizFormProps> = ({ isEditing = false }) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quizImageUrl = useImageUrlField();
  
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    quiz_type_id: undefined
  });
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizId = id ? parseInt(id, 10) : 0;

  useEffect(() => {
    if (isEditing && id) {
      fetchQuizData(parseInt(id, 10));
    }
  }, [isEditing, id]);

  const fetchQuizData = async (quizId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [quiz, quizDimensions] = await Promise.all([
        quizApi.getById(quizId),
        dimensionApi.getAll(quizId)
      ]);
      
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        quiz_type_id: quiz.quiz_type_id || undefined
      });
      
      quizImageUrl.setValue(quiz.image_url || '');
      setDimensions(quizDimensions);
    } catch (err) {
      setError(t('errors.form.quizLoading'));
      console.error('Failed to fetch quiz data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDimensionsUpdate = (updatedDimensions: Dimension[]) => {
    setDimensions(updatedDimensions);
  };

  const updateFormField = <K extends keyof QuizFormData>(
    field: K, 
    value: QuizFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormField(name as keyof QuizFormData, value);
  };

  const handleTypeIdChange = (selectedId?: number) => {
    updateFormField('quiz_type_id', selectedId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const quizData = {
        ...formData,
        image_url: quizImageUrl.getCleanUrl()
      };
      
      if (isEditing && id) {
        const updateData: QuizUpdateInput = {
          title: quizData.title,
          description: quizData.description,
          image_url: quizData.image_url,
          quiz_type_id: quizData.quiz_type_id
        };
        
        await quizApi.update(parseInt(id, 10), updateData);
        navigate(ROUTES.QUIZ.MANAGE);
      } else {
        const createData: QuizCreateInput = {
          title: quizData.title,
          description: quizData.description,
          image_url: quizData.image_url,
          quiz_type_id: quizData.quiz_type_id
        };
        
        const newQuiz = await quizApi.create(createData);
        navigate(ROUTES.QUIZ.EDIT_BY_ID(newQuiz.id));
      }
    } catch (err) {
      setError(t('errors.form.quizSaving'));
      console.error('Failed to save quiz:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.QUIZ.MANAGE);
  };

  const canSubmit = formData.title.trim().length >= UI.LIMITS?.QUIZ_TITLE_MIN_LENGTH && 
                   formData.title.trim().length <= UI.LIMITS?.QUIZ_TITLE_MAX_LENGTH && 
                   quizImageUrl.isValid;

  const renderQuizForm = () => (
    <form onSubmit={handleSubmit} className={styles.compactForm}>
      <div className={styles.formFields}>
        <FormField 
          required
          className={styles.titleField}
        >
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            minLength={UI.LIMITS?.QUIZ_TITLE_MIN_LENGTH || 3}
            maxLength={UI.LIMITS?.QUIZ_TITLE_MAX_LENGTH || 255}
            placeholder={t('quiz.form.titlePlaceholder')}
            className={styles.titleInput}
            autoFocus={!isEditing}
          />
        </FormField>
        
        <FormField 
          className={styles.descriptionField}
        >
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('quiz.form.descriptionPlaceholder')}
            className={styles.descriptionInput}
            rows={3}
            maxLength={UI.LIMITS?.QUIZ_DESCRIPTION_MAX_LENGTH || 1000}
          />
        </FormField>

        <FormField 
          className={styles.imageField}
        >
          <ImageUrlField
            value={quizImageUrl.value}
            onChange={quizImageUrl.setValue}
            onValidationChange={quizImageUrl.handleValidationChange}
            placeholder={t('quiz.form.imageUrlPlaceholder')}
            previewMaxHeight={200}
          />
        </FormField>

        <FormField 
          className={styles.typeField}
        >
          <QuizTypeSelector
            selectedTypeId={formData.quiz_type_id}
            onChange={handleTypeIdChange}
            disabled={isLoading}
          />
        </FormField>
      </div>
      
      <div className={styles.formActions}>
        <Button 
          variant="text" 
          onClick={handleCancel}
          type="button"
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          loading={isLoading}
          disabled={!canSubmit}
        >
          {isEditing ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </form>
  );

  if (isLoading && isEditing) {
    return <LoadingIndicator message={t('quiz.loading')} />;
  }

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
      label: t('quiz.tabs.quiz'),
      content: renderQuizForm()
    },
    {
      id: 'questions',
      label: t('quiz.tabs.questions'),
      content: <QuestionManager quizId={quizId} dimensions={dimensions} />
    },
    {
      id: 'dimensions',
      label: t('quiz.tabs.dimensions'),
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