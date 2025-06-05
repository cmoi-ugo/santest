import React from 'react';

import { useTranslation } from '@/hooks';

import styles from './QuestionPreviews.module.css';

/**
 * Aperçu des questions texte en mode lecture seule
 */
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