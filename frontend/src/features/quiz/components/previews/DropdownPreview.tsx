import React from 'react';

import { useTranslation } from '@/hooks';

import type { QuestionOption } from '../../types/question.types';
import styles from './QuestionPreviews.module.css';

interface DropdownPreviewProps {
  options: QuestionOption[];
}

/**
 * Aperçu des questions dropdown en mode lecture seule
 */
export const DropdownPreview: React.FC<DropdownPreviewProps> = ({
  options
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.optionsPreview}>
      <select disabled className={styles.dropdownPreview}>
        <option>{t('questions.form.selectOption')}</option>
        {options?.map((option, idx) => (
          <option key={idx}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};