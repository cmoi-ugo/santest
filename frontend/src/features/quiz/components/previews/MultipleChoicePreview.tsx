import React from 'react';
import { QuestionOption } from '@/features/quiz/types/question.types';
import styles from './QuestionPreviews.module.css';

interface MultipleChoicePreviewProps {
  options: QuestionOption[];
}

export const MultipleChoicePreview: React.FC<MultipleChoicePreviewProps> = ({
  options
}) => {
  return (
    <div className={styles.optionsPreview}>
      {options?.map((option, idx) => (
        <div key={idx} className={styles.radioOption}>
          <input type="radio" disabled />
          <label>{option.label}</label>
        </div>
      ))}
    </div>
  );
};