import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import styles from './QuestionPreviews.module.css';

export const TextPreview: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.optionsPreview}>
      <input 
        type="text" 
        placeholder={t('questions.form.textPreviewPlaceholder')} 
        disabled 
        className={styles.textInput} 
      />
    </div>
  );
};