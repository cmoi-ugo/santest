import React from 'react';

import { useTranslation } from '@/hooks';

import { CheckboxQuestion } from '../../question-inputs/CheckboxQuestion';
import { DropdownQuestion } from '../../question-inputs/DropdownQuestion';
import { LinearScaleQuestion } from '../../question-inputs/LinearScaleQuestion';
import { MultipleChoiceQuestion } from '../../question-inputs/MultipleChoiceQuestion';
import { TextQuestion } from '../../question-inputs/TextQuestion';
import { 
  Question, 
  QuestionType, 
  QuestionOption, 
  LinearScaleOptions 
} from '../../../types/question.types';
import styles from './QuestionDisplay.module.css';

interface QuestionDisplayProps {
  question: Question;
  index: number;
  value: any;
  onChange: (value: any) => void;
}

/**
 * Affiche une question avec son input approprié selon le type
 */
export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  index,
  value,
  onChange
}) => {
  const { t } = useTranslation();
  
  const renderQuestionInput = () => {
    switch (question.question_type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceQuestion
            questionId={question.id}
            options={question.options as QuestionOption[]}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.CHECKBOX:
        return (
          <CheckboxQuestion
            questionId={question.id}
            options={question.options as QuestionOption[]}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.DROPDOWN:
        return (
          <DropdownQuestion
            questionId={question.id}
            options={question.options as QuestionOption[]}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.LINEAR_SCALE:
        return (
          <LinearScaleQuestion
            questionId={question.id}
            options={question.options as LinearScaleOptions}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.TEXT:
        return (
          <TextQuestion
            value={value}
            onChange={onChange}
          />
        );
      
      default:
        return null;
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className={styles.questionContainer}>
      <div className={styles.questionHeader}>
        <span className={styles.questionNumber}>{index + 1}.</span>
        <h3 className={styles.questionText}>
          {question.text}
          {question.required && <span className={styles.required}> *</span>}
        </h3>
      </div>

      {question.image_url && (
        <div className={styles.questionImageContainer}>
          <img 
            src={question.image_url}
            alt={t('questions.imageAlt', { number: index + 1 })}
            className={styles.questionImage}
            onError={handleImageError}
          />
        </div>
      )}

      <div className={styles.questionBody}>
        {renderQuestionInput()}
      </div>
    </div>
  );
};