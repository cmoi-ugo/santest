import React from 'react';

import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
}

/**
 * Affiche un message d'erreur stylé
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return message ? (
    <div className={styles.errorContainer}>
      <p className={styles.errorMessage}>{message}</p>
    </div>
  ) : null;
};