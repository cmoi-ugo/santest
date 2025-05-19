import React from 'react';
import { LinearScaleOptions } from '@/features/quiz/types/question.types';
import styles from '@/features/quiz/styles/QuestionEditor.module.css';

interface ScaleOptionsEditorProps {
  options: LinearScaleOptions;
  onOptionChange: (field: keyof LinearScaleOptions, value: any) => void;
}

export const ScaleOptionsEditor: React.FC<ScaleOptionsEditorProps> = ({
  options,
  onOptionChange
}) => {
  return (
    <div className={styles.scaleOptionsEditor}>
      <div className={styles.scaleRow}>
        <label>Valeur minimale :</label>
        <input
          type="number"
          value={options.min_value}
          onChange={(e) => onOptionChange('min_value', parseInt(e.target.value))}
          min={0}
        />
      </div>
      <div className={styles.scaleRow}>
        <label>Valeur maximale :</label>
        <input
          type="number"
          value={options.max_value}
          onChange={(e) => onOptionChange('max_value', parseInt(e.target.value))}
          min={options.min_value + 1}
        />
      </div>
      <div className={styles.scaleRow}>
        <label>Label minimum (optionnel) :</label>
        <input
          type="text"
          value={options.min_label || ''}
          onChange={(e) => onOptionChange('min_label', e.target.value)}
        />
      </div>
      <div className={styles.scaleRow}>
        <label>Label maximum (optionnel) :</label>
        <input
          type="text"
          value={options.max_label || ''}
          onChange={(e) => onOptionChange('max_label', e.target.value)}
        />
      </div>
    </div>
  );
};