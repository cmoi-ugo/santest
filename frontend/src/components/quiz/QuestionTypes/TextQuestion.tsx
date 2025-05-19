import React from 'react';
import styles from './QuestionTypes.module.css';

interface TextQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  value,
  onChange
}) => {
  return (
    <textarea
      className={styles.textArea}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Entrez votre réponse ..."
      rows={3}
    />
  );
};