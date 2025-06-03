import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import styles from './LoadingIndicator.module.css';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message,
  fullScreen = false
}) => {
  const { t } = useTranslation();
  const defaultMessage = message || t('common.loading');
  
  return (
    <div className={`${styles.loadingContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{defaultMessage}</p>
    </div>
  );
};