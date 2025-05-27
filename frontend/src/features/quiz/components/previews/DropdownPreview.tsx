import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { QuestionOption } from '@/features/quiz/types/question.types';
import styles from './QuestionPreviews.module.css';

interface DropdownPreviewProps {
  options: QuestionOption[];
}

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