import { useState } from 'react';

import { Button, ConfirmDialog, ErrorMessage, LoadingIndicator } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { UI } from '@/config';

import { resetApi } from '../../api/resetApi';
import type { ResetPreview } from '../../types/reset.types';
import styles from './ResetApplicationSection.module.css';

/**
 * Section de réinitialisation de l'application avec aperçu et confirmation
 */
export const ResetApplicationSection = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<ResetPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await resetApi.getPreview();
      setPreview(data);
      setShowConfirmDialog(true);
    } catch (err) {
      setError(t('errors.previewLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const executeReset = async () => {
    try {
      setIsLoading(true);
      setShowConfirmDialog(false);
      await resetApi.executeReset();
      setPreview(null);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), UI.TIMEOUTS.SUCCESS_MESSAGE || 3000);
    } catch (err) {
      setError(t('errors.resetExecution'));
      setShowConfirmDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    executeReset();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPreview(null);
  };

  const getConfirmMessage = (): string => {
    if (!preview) return t('settings.reset.defaultConfirmMessage');

    const stats = preview.items_to_delete;
    
    return `${t('settings.reset.warningMessage')}
      - ${stats.quizzes} ${t('settings.reset.items.quizzes')}
      - ${stats.questions} ${t('settings.reset.items.questions')}
      - ${stats.answers} ${t('settings.reset.items.answers')}
      - ${stats.dimensions} ${t('settings.reset.items.dimensions')}
      - ${stats.favorites} ${t('settings.reset.items.favorites')}
      - ${stats.advices} ${t('settings.reset.items.advices')}`;
  };

  if (isLoading) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  return (
    <div className={styles.container}>
      <Button
        variant="danger"
        onClick={fetchPreview}
        disabled={isLoading}
        loading={isLoading}
      >
        {t('settings.reset.button')}
      </Button>

      {error && <ErrorMessage message={error} />}
      
      {success && (
        <div className={styles.successMessage}>
          {t('settings.reset.successTitle')}
        </div>
      )}

      <ConfirmDialog 
        isOpen={showConfirmDialog}
        title={t('settings.reset.confirmTitle')}
        message={getConfirmMessage()}
        confirmLabel={t('settings.reset.confirmButton')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        destructive={true}
      />
    </div>
  );
};