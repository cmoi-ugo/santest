import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button/Button';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { resetApi } from '@/features/settings/api/resetApi';
import { ResetPreview, ResetResult } from '@/features/settings/types/reset.types';
import { MdClear } from 'react-icons/md';
import { UI } from '@/config';
import styles from './ResetApplicationSection.module.css';

export const ResetApplicationSection = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<ResetPreview | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      const data = await resetApi.executeReset();
      setResetResult(data);
      setPreview(null);
      setError(null);
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

  const clearResult = () => {
    setResetResult(null);
    setError(null);
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

  if (resetResult) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.actionContainer}>
          <Button
            variant="text"
            size="small"
            onClick={clearResult}
          >
            <MdClear size={UI.ICONS.SIZE.SMALL} />
          </Button>
        </div>
        <h4 className={styles.successTitle}>{t('settings.reset.successTitle')}</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error} />
        <Button
          variant="danger"
          onClick={() => setError(null)}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  return (
    <>
      <Button
        variant="danger"
        onClick={fetchPreview}
        disabled={isLoading}
        loading={isLoading}
      >
        {t('settings.reset.button')}
      </Button>

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
    </>
  );
};