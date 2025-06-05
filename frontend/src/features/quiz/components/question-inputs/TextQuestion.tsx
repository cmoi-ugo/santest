import React from 'react';

import { useTranslation } from '@/hooks';

import styles from './QuestionTypes.module.css';

interface TextQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Composant pour les questions à réponse libre (textarea)
 */
export const TextQuestion: React.FC<TextQuestionProps> = ({
  value,
  onChange
}) => {
  const { t } = useTranslation();
  
  return (
    <textarea
      className={styles.textArea}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('questions.form.textAnswerPlaceholder')}
      rows={3}
    />
  );
};