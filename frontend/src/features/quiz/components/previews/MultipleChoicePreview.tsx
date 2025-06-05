import React from 'react';

import type { QuestionOption } from '../../types/question.types';
import styles from './QuestionPreviews.module.css';

interface MultipleChoicePreviewProps {
  options: QuestionOption[];
}

/**
 * Aperçu des questions à choix multiple en mode lecture seule
 */
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