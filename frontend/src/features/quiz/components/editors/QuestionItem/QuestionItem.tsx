import { useState } from 'react';
import { MdDelete, MdDragIndicator, MdEdit, MdSettings } from 'react-icons/md';

import { Button } from '@/components/ui';
import { UI } from '@/config';
import { useTranslation } from '@/hooks';

import { CheckboxPreview } from '../../previews/CheckboxPreview';
import { DropdownPreview } from '../../previews/DropdownPreview';
import { LinearScalePreview } from '../../previews/LinearScalePreview';
import { MultipleChoicePreview } from '../../previews/MultipleChoicePreview';
import { TextPreview } from '../../previews/TextPreview';
import type { Dimension } from '../../../types/dimension.types';
import { 
  Question, 
  QuestionType, 
  QuestionOption, 
  LinearScaleOptions 
} from '../../../types/question.types';
import { QuestionDimensionLink } from '../QuestionDimensionLink/QuestionDimensionLink';
import { QuestionEditor } from '../QuestionEditor/QuestionEditor';
import styles from './QuestionItem.module.css';

interface QuestionItemProps {
  question: Question;
  index: number;
  onDelete: (questionId: number) => void;
  onSave: (question: Partial<Question>) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  dimensions?: Dimension[];
}

/**
 * Retourne le label traduit d'un type de question
 */
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

/**
 * Élément de question avec prévisualisation, édition inline et gestion des dimensions
 */
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
    setShowDimensionLink(prev => !prev);
    setIsEditing(false);
  };

  const handleSave = (updatedQuestion: Partial<Question>) => {
    onSave(updatedQuestion);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  const renderQuestionPreview = () => {
    if (!question.options && question.question_type !== QuestionType.TEXT) {
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

  const canConfigureDimensions = dimensions.length > 0;

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
          {question.required && (
            <span className={styles.required} title={t('questions.form.required')}>
              *
            </span>
          )}
        </div>
        
        <div className={styles.questionActions}>
          <Button 
            variant="text"
            size="small"
            icon={<MdEdit size={UI.ICONS.SIZE.MEDIUM} />}
            onClick={handleEditClick}
            title={t('actions.edit')}
            className={styles.actionButton}
          />
          
          {canConfigureDimensions && (
            <Button 
              variant="text"
              size="small"
              icon={<MdSettings size={UI.ICONS.SIZE.MEDIUM} />}
              onClick={handleDimensionClick}
              title={t('actions.configure')}
              className={`${styles.actionButton} ${showDimensionLink ? styles.active : ''}`}
            />
          )}
          
          <Button 
            variant="text"
            size="small"
            icon={<MdDelete size={UI.ICONS.SIZE.MEDIUM} />}
            onClick={() => onDelete(question.id)}
            title={t('actions.delete')}
            className={`${styles.actionButton} ${styles.deleteButton}`}
          />
        </div>
      </div>
      
      {question.image_url && (
        <div className={styles.questionImageContainer}>
          <img 
            src={question.image_url}
            alt={t('questions.imageAlt', { number: index + 1 })}
            className={styles.questionImage}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}

      <div className={styles.questionContent}>
        <div className={styles.previewSection}>
          {renderQuestionPreview()}
        </div>
        
        <div className={styles.questionMeta}>
          <div className={styles.questionType}>
            <span className={styles.typeLabel}>
              {t('questions.typeLabel')}:
            </span>
            <span className={styles.typeValue}>
              {getQuestionTypeLabel(question.question_type, t)}
            </span>
          </div>
        </div>
        
        {showDimensionLink && canConfigureDimensions && (
          <div className={styles.dimensionSection}>
            <QuestionDimensionLink 
              question={question} 
              dimensions={dimensions} 
            />
          </div>
        )}
      </div>
    </div>
  );
};