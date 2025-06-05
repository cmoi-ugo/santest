import React from 'react';

import { UI } from '@/config';
import { useTranslation } from '@/hooks';

import type { LinearScaleOptions } from '../../../types/question.types';
import styles from '../QuestionEditor/QuestionEditor.module.css';

interface ScaleOptionsEditorProps {
  options: LinearScaleOptions;
  onOptionChange: (field: keyof LinearScaleOptions, value: any) => void;
}

/**
 * Éditeur pour les options d'échelle linéaire avec validation des contraintes
 */
export const ScaleOptionsEditor: React.FC<ScaleOptionsEditorProps> = ({
  options,
  onOptionChange
}) => {
  const { t } = useTranslation();

  const handleMinValueChange = (newMinValue: number) => {
    const clampedMinValue = Math.max(
      UI.LIMITS?.SCALE_MIN_VALUE || 1, 
      Math.min(UI.LIMITS?.SCALE_MAX_VALUE || 10, newMinValue)
    );
    onOptionChange('min_value', clampedMinValue);
    
    const maxRange = UI.LIMITS?.SCALE_MAX_RANGE || 9;
    
    if (options.max_value <= clampedMinValue) {
      onOptionChange('max_value', Math.min(UI.LIMITS?.SCALE_MAX_VALUE || 10, clampedMinValue + 1));
    } else if (options.max_value - clampedMinValue > maxRange) {
      onOptionChange('max_value', Math.min(UI.LIMITS?.SCALE_MAX_VALUE || 10, clampedMinValue + maxRange));
    }
  };

  const handleMaxValueChange = (newMaxValue: number) => {
    const clampedMaxValue = Math.max(
      UI.LIMITS?.SCALE_MIN_VALUE || 1, 
      Math.min(UI.LIMITS?.SCALE_MAX_VALUE || 10, newMaxValue)
    );
    onOptionChange('max_value', clampedMaxValue);
    
    const maxRange = UI.LIMITS?.SCALE_MAX_RANGE || 9;
    
    if (options.min_value >= clampedMaxValue) {
      onOptionChange('min_value', Math.max(UI.LIMITS?.SCALE_MIN_VALUE || 1, clampedMaxValue - 1));
    } else if (clampedMaxValue - options.min_value > maxRange) {
      onOptionChange('min_value', Math.max(UI.LIMITS?.SCALE_MIN_VALUE || 1, clampedMaxValue - maxRange));
    }
  };

  const getMaxAllowedValue = (isForMax: boolean): number => {
    const maxRange = UI.LIMITS?.SCALE_MAX_RANGE || 9;
    const maxValue = UI.LIMITS?.SCALE_MAX_VALUE || 10;
    const minValue = UI.LIMITS?.SCALE_MIN_VALUE || 1;
    
    if (isForMax) {
      return Math.min(maxValue, options.min_value + maxRange);
    } else {
      return Math.max(minValue, options.max_value - maxRange);
    }
  };

  const getRangeSize = (): number => {
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
          onChange={(e) => handleMinValueChange(parseInt(e.target.value, 10) || UI.LIMITS?.SCALE_MIN_VALUE || 1)}
          min={UI.LIMITS?.SCALE_MIN_VALUE || 1}
          max={getMaxAllowedValue(false)}
          className={styles.scaleInput}
        />
      </div>
      
      <div className={styles.scaleRow}>
        <label>{t('quiz.form.maxValue')}:</label>
        <input
          type="number"
          value={options.max_value}
          onChange={(e) => handleMaxValueChange(parseInt(e.target.value, 10) || 2)}
          min={options.min_value + 1}
          max={getMaxAllowedValue(true)}
          className={styles.scaleInput}
        />
      </div>
      
      <div className={styles.scaleRow}>
        <label>
          {t('quiz.form.minLabel')} 
          <span className={styles.optionalLabel}> {t('common.optional')}</span>
        </label>
        <input
          type="text"
          value={options.min_label || ''}
          onChange={(e) => onOptionChange('min_label', e.target.value)}
          placeholder={t('quiz.form.minLabelPlaceholder', { value: options.min_value })}
          className={styles.labelInput}
        />
      </div>
      
      <div className={styles.scaleRow}>
        <label>
          {t('quiz.form.maxLabel')} 
          <span className={styles.optionalLabel}> {t('common.optional')}</span>
        </label>
        <input
          type="text"
          value={options.max_label || ''}
          onChange={(e) => onOptionChange('max_label', e.target.value)}
          placeholder={t('quiz.form.maxLabelPlaceholder', { value: options.max_value })}
          className={styles.labelInput}
        />
      </div>
    </div>
  );
};