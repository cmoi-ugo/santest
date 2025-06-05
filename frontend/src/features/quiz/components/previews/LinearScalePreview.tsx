import React from 'react';

import type { LinearScaleOptions } from '../../types/question.types';
import styles from './QuestionPreviews.module.css';

interface LinearScalePreviewProps {
  options: LinearScaleOptions;
}

/**
 * Aperçu des questions d'échelle linéaire en mode lecture seule
 */
export const LinearScalePreview: React.FC<LinearScalePreviewProps> = ({
  options
}) => {
  return (
    <div className={styles.scalePreview}>
      <span className={styles.scaleLabel}>{options?.min_label || options?.min_value}</span>
      <div className={styles.scaleRange}>
        {options && Array.from(
          { length: options.max_value - options.min_value + 1 }, 
          (_, i) => options.min_value + i
        ).map(value => (
          <span key={value} className={styles.scaleValue}>{value}</span>
        ))}
      </div>
      <span className={styles.scaleLabel}>{options?.max_label || options?.max_value}</span>
    </div>
  );
};