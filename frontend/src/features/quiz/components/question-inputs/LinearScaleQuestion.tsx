import React from 'react';

import type { LinearScaleOptions } from '../../types/question.types';
import styles from './QuestionTypes.module.css';

interface LinearScaleQuestionProps {
  questionId: number;
  options: LinearScaleOptions;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Composant pour les questions d'échelle linéaire (1-5, etc.)
 */
export const LinearScaleQuestion: React.FC<LinearScaleQuestionProps> = ({
  questionId,
  options,
  value,
  onChange
}) => {
  const scaleValues = Array.from(
    { length: options.max_value - options.min_value + 1 },
    (_, i) => options.min_value + i
  );

  return (
    <div className={styles.scaleContainer}>
      <span className={styles.scaleLabel}>
        {options.min_label || options.min_value}
      </span>
      <div className={styles.scaleValues}>
        {scaleValues.map(scaleValue => (
          <label key={scaleValue} className={styles.scaleItem}>
            <input
              type="radio"
              name={`question_${questionId}`}
              value={scaleValue}
              checked={value === scaleValue}
              onChange={(e) => onChange(parseInt(e.target.value))}
            />
            <span>{scaleValue}</span>
          </label>
        ))}
      </div>
      <span className={styles.scaleLabel}>
        {options.max_label || options.max_value}
      </span>
    </div>
  );
};