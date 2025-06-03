import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { quizTypeApi } from '@/features/quiz/api/quizTypeApi';
import { QuizTypeSelector } from '@/features/quiz/components/configuration/QuizTypeSelector/QuizTypeSelector';
import { Button } from '@/components/ui/Button/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { MdDelete } from 'react-icons/md';
import styles from './DeleteQuizType.module.css';

export const DeleteQuizType = () => {
  const { t } = useTranslation();
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ 
    isOpen: boolean; 
    typeId: number | null; 
    typeName: string 
  }>({
    isOpen: false,
    typeId: null,
    typeName: ''
  });

  const handleDeleteType = async (id: number) => {
    try {
      await quizTypeApi.delete(id);
      setSelectedTypeId(undefined);
      setDeleteDialog({ isOpen: false, typeId: null, typeName: '' });
      setError(null);
      setSuccess(true);
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('settings.quizTypes.errors.deleting'));
      setDeleteDialog({ isOpen: false, typeId: null, typeName: '' });
    }
  };

  const openDeleteDialog = async () => {
    if (!selectedTypeId) return;
    
    try {
      const type = await quizTypeApi.getById(selectedTypeId);
      setDeleteDialog({
        isOpen: true,
        typeId: type.id,
        typeName: type.name
      });
    } catch (err) {
      setError(t('settings.quizTypes.errors.loading'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectRow}>
        <QuizTypeSelector
          selectedTypeId={selectedTypeId}
          onChange={setSelectedTypeId}
          disabled={false}
          refreshTrigger={refreshTrigger}
        />
        <Button
          variant="danger"
          onClick={openDeleteDialog}
          disabled={!selectedTypeId}
          icon={<MdDelete />}
        >
          {t('actions.delete')}
        </Button>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {success && (
        <div className={styles.successMessage}>
          {t('settings.quizTypes.delete.success')}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('settings.quizTypes.deleteDialog.title')}
        message={t('settings.quizTypes.deleteDialog.message', { typeName: deleteDialog.typeName })}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => deleteDialog.typeId && handleDeleteType(deleteDialog.typeId)}
        onCancel={() => setDeleteDialog({ isOpen: false, typeId: null, typeName: '' })}
        destructive={true}
      />
    </div>
  );
};