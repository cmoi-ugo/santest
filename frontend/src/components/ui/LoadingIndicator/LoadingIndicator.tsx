import React from 'react';
import styles from './LoadingIndicator.module.css';
import { MESSAGES } from '@/config';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = MESSAGES.UI.LOADING,
  fullScreen = false
}) => {
  return (
    <div className={`${styles.loadingContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};