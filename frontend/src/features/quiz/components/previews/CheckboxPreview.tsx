import React from 'react';

import type { QuestionOption } from '../../types/question.types';
import styles from './QuestionPreviews.module.css';

interface CheckboxPreviewProps {
  options: QuestionOption[];
}

/**
 * Aperçu des questions checkbox en mode lecture seule
 */
export const CheckboxPreview: React.FC<CheckboxPreviewProps> = ({
  options
}) => {
  return (
    <div className={styles.optionsPreview}>
      {options?.map((option, idx) => (
        <div key={idx} className={styles.checkboxOption}>
          <input type="checkbox" disabled />
          <label>{option.label}</label>
        </div>
      ))}
    </div>
  );
};