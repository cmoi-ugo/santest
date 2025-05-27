import { useState } from 'react';
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
      setError('Erreur lors du chargement de l\'aperçu');
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
      setError('Erreur lors de la réinitialisation');
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
    if (!preview) return 'Êtes-vous sûr de vouloir réinitialiser l\'application ?';

    const stats = preview.items_to_delete;
    
    return `Attention ! Cette action est irréversible, elle supprimera : 
      - ${stats.quizzes} quiz
      - ${stats.questions} questions
      - ${stats.answers} réponses
      - ${stats.dimensions} dimensions
      - ${stats.favorites} favoris`;
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
        <h4 className={styles.successTitle}>Réinitialisation réussie !</h4>
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
          Réessayer
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingIndicator message="Chargement ..." />;
  }

  return (
    <>
      <Button
        variant="danger"
        onClick={fetchPreview}
        disabled={isLoading}
        loading={isLoading}
      >
        Réinitialiser
      </Button>

      <ConfirmDialog 
        isOpen={showConfirmDialog}
        title="Confirmation de réinitialisation"
        message={getConfirmMessage()}
        confirmLabel="Confirmer la réinitialisation"
        cancelLabel="Annuler"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        destructive={true}
      />
    </>
  );
};