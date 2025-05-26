import React from 'react';
import styles from './QuestionPreviews.module.css';

export const TextPreview: React.FC = () => {
  return (
    <div className={styles.optionsPreview}>
      <input type="text" placeholder="Réponse textuelle" disabled className={styles.textInput} />
    </div>
  );
};