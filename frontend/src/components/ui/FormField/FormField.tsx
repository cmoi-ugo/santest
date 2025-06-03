import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import styles from './FormField.module.css';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  className = ''
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={`${styles.formField} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>{t('common.required')}</span>}
        </label>
      )}
      {children}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};