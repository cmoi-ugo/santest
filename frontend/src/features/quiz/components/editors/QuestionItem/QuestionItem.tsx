import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import { QuestionEditor } from '@/features/quiz/components/editors/QuestionEditor/QuestionEditor';
import { QuestionDimensionLink } from '@/features/quiz/components/editors/QuestionDimensionLink/QuestionDimensionLink';
import { Dimension } from '@/features/quiz/types/dimension.types';
import { MultipleChoicePreview } from '@/features/quiz/components/previews/MultipleChoicePreview';
import { CheckboxPreview } from '@/features/quiz/components/previews/CheckboxPreview';
import { DropdownPreview } from '@/features/quiz/components/previews/DropdownPreview';
import { LinearScalePreview } from '@/features/quiz/components/previews/LinearScalePreview';
import { TextPreview } from '@/features/quiz/components/previews/TextPreview';
import { UI } from '@/config';
import styles from './QuestionItem.module.css';
import { MdEdit, MdDelete, MdDragIndicator, MdSettings } from 'react-icons/md';

interface QuestionItemProps {
  question: Question;
  index: number;
  onDelete: (questionId: number) => void;
  onSave: (question: Partial<Question>) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  dimensions?: Dimension[];
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ 
  question, 
  index, 
  onDelete,
  onSave,
  dragHandleProps,
  dimensions = []
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDimensionLink, setShowDimensionLink] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowDimensionLink(false);
  };

  const handleDimensionClick = () => {
    setShowDimensionLink(!showDimensionLink);
    setIsEditing(false);
  };

  const handleSave = (updatedQuestion: Partial<Question>) => {
    onSave(updatedQuestion);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const renderQuestionPreview = () => {
    if (!question.options) {
        return null;
    }

    switch (question.question_type) {
        case QuestionType.MULTIPLE_CHOICE:
            return <MultipleChoicePreview options={question.options as QuestionOption[]} />;
        
        case QuestionType.CHECKBOX:
            return <CheckboxPreview options={question.options as QuestionOption[]} />;
        
        case QuestionType.DROPDOWN:
            return <DropdownPreview options={question.options as QuestionOption[]} />;
        
        case QuestionType.LINEAR_SCALE:
            return <LinearScalePreview options={question.options as LinearScaleOptions} />;
        
        case QuestionType.TEXT:
            return <TextPreview />;
        
        default:
            return null;
    }
  };

  if (isEditing) {
    return (
      <div className={styles.questionItem}>
        <div className={styles.inlineEditorWrapper}>
          <QuestionEditor
            quizId={question.quiz_id}
            question={question}
            onSave={handleSave}
            onCancel={handleCancel}
            inline={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.questionItem}>
      <div className={styles.questionHeader}>
        <div className={styles.dragHandle} {...dragHandleProps}>
          <MdDragIndicator size={UI.ICONS.SIZE.MEDIUM} />
        </div>
        <div className={styles.questionNumber}>{index + 1}.</div>
        <div className={styles.questionText}>
          {question.text}
          {question.required && <span className={styles.required}>*</span>}
        </div>
        <div className={styles.questionActions}>
          <Button 
            variant="text"
            size="small"
            icon={<MdEdit size={UI.ICONS.SIZE.MEDIUM}/>}
            onClick={handleEditClick}
            title={t('actions.edit')}
          />
          {dimensions.length > 0 && (
            <Button 
              variant="text"
              size="small"
              icon={<MdSettings size={UI.ICONS.SIZE.MEDIUM}/>}
              onClick={handleDimensionClick}
              title={t('actions.configure')}
            />
          )}
          <Button 
            variant="text"
            size="small"
            icon={<MdDelete size={UI.ICONS.SIZE.MEDIUM}/>}
            onClick={() => onDelete(question.id)}
            title={t('actions.delete')}
          />
        </div>
      </div>
      
      {question.image_url && (
        <div className={styles.questionImageContainer}>
          <img 
            src={question.image_url}
            alt={t('questions.imageAlt', { number: index + 1 })}
            className={styles.questionImage}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className={styles.questionContent}>
        {renderQuestionPreview()}
        <div className={styles.questionType}>
          {t('questions.typeLabel')}: {getQuestionTypeLabel(question.question_type, t)}
        </div>
        {showDimensionLink && dimensions.length > 0 && (
          <QuestionDimensionLink 
            question={question} 
            dimensions={dimensions} 
          />
        )}
      </div>
    </div>
  );
};

const getQuestionTypeLabel = (type: QuestionType, t: (key: string) => string): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return t('questions.types.multipleChoice');
    case QuestionType.CHECKBOX:
      return t('questions.types.checkbox');
    case QuestionType.DROPDOWN:
      return t('questions.types.dropdown');
    case QuestionType.LINEAR_SCALE:
      return t('questions.types.linearScale');
    case QuestionType.TEXT:
      return t('questions.types.text');
    default:
      return t('questions.types.unknown');
  }
};