import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { LinearScaleOptions } from '@/features/quiz/types/question.types';
import styles from '@/features/quiz/components/editors/QuestionEditor/QuestionEditor.module.css';

interface ScaleOptionsEditorProps {
  options: LinearScaleOptions;
  onOptionChange: (field: keyof LinearScaleOptions, value: any) => void;
}

export const ScaleOptionsEditor: React.FC<ScaleOptionsEditorProps> = ({
  options,
  onOptionChange
}) => {
  const { t } = useTranslation();
  const handleMinValueChange = (newMinValue: number) => {
    const clampedMinValue = Math.max(1, Math.min(10, newMinValue));
    onOptionChange('min_value', clampedMinValue);
    
    if (options.max_value <= clampedMinValue) {
      onOptionChange('max_value', Math.min(10, clampedMinValue + 1));
    } else if (options.max_value - clampedMinValue > 9) {
      onOptionChange('max_value', Math.min(10, clampedMinValue + 9));
    }
  };

  const handleMaxValueChange = (newMaxValue: number) => {
    const clampedMaxValue = Math.max(1, Math.min(10, newMaxValue));
    onOptionChange('max_value', clampedMaxValue);
    
    if (options.min_value >= clampedMaxValue) {
      onOptionChange('min_value', Math.max(1, clampedMaxValue - 1));
    } else if (clampedMaxValue - options.min_value > 9) {
      onOptionChange('min_value', Math.max(1, clampedMaxValue - 9));
    }
  };

  const getMaxAllowedValue = (isForMax: boolean) => {
    if (isForMax) {
      return Math.min(10, options.min_value + 9);
    } else {
      return Math.max(1, options.max_value - 9);
    }
  };

  const getRangeSize = () => {
    return options.max_value - options.min_value + 1;
  };

  return (
    <div className={styles.scaleOptionsEditor}>
      <div className={styles.scaleInfo}>
        <p className={styles.scaleNote}>
          {t('quiz.form.scaleRange', { 
            min: options.min_value, 
            max: options.max_value, 
            count: getRangeSize() 
          })}
        </p>
        <p className={styles.scaleConstraint}>
          {t('quiz.form.scaleConstraint')}
        </p>
      </div>
      
      <div className={styles.scaleRow}>
        <label>{t('quiz.form.minValue')}:</label>
        <input
          type="number"
          value={options.min_value}
          onChange={(e) => handleMinValueChange(parseInt(e.target.value) || 1)}
          min={1}
          max={getMaxAllowedValue(false)}
        />
      </div>
      
      <div className={styles.scaleRow}>
        <label>{t('quiz.form.maxValue')}:</label>
        <input
          type="number"
          value={options.max_value}
          onChange={(e) => handleMaxValueChange(parseInt(e.target.value) || 2)}
          min={options.min_value + 1}
          max={getMaxAllowedValue(true)}
        />
      </div>
      
      <div className={styles.scaleRow}>
        <label>{t('quiz.form.minLabel')} {t('common.optional')}:</label>
        <input
          type="text"
          value={options.min_label || ''}
          onChange={(e) => onOptionChange('min_label', e.target.value)}
          placeholder={t('quiz.form.minLabelPlaceholder', { value: options.min_value })}
        />
      </div>
      
      <div className={styles.scaleRow}>
        <label>{t('quiz.form.maxLabel')} {t('common.optional')}:</label>
        <input
          type="text"
          value={options.max_label || ''}
          onChange={(e) => onOptionChange('max_label', e.target.value)}
          placeholder={t('quiz.form.maxLabelPlaceholder', { value: options.max_value })}
        />
      </div>
    </div>
  );
};