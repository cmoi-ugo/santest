import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false
}) => {
  const { t } = useTranslation();
  const defaultConfirmLabel = confirmLabel || t('ui.confirmDialog.defaultConfirm');
  const defaultCancelLabel = cancelLabel || t('ui.confirmDialog.defaultCancel');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button 
            className={styles.cancelButton} 
            onClick={onCancel}
          >
            {defaultCancelLabel}
          </button>
          <button 
            className={`${styles.confirmButton} ${destructive ? styles.destructive : ''}`} 
            onClick={onConfirm}
          >
            {defaultConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};