import React from 'react';

import type { QuestionOption } from '../../types/question.types';
import styles from './QuestionTypes.module.css';

interface MultipleChoiceQuestionProps {
  questionId: number;
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Composant pour les questions à choix unique (radio buttons)
 */
export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  questionId,
  options,
  value,
  onChange
}) => {
  return (
    <div className={styles.optionsContainer}>
      {options?.map((option) => (
        <label key={option.value} className={styles.radioLabel}>
          <input
            type="radio"
            name={`question_${questionId}`}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};