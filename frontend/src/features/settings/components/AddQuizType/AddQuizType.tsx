import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { quizTypeApi } from '@/features/quiz/api/quizTypeApi';
import { QuizTypeCreateInput } from '@/features/quiz/types/quiz.types';
import { Button } from '@/components/ui/Button/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { MdAdd } from 'react-icons/md';
import styles from './AddQuizType.module.css';

export const AddQuizType = () => {
  const { t } = useTranslation();
  const [newTypeName, setNewTypeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateType = async () => {
    if (!newTypeName.trim() || isCreating) return;

    try {
      setIsCreating(true);
      setError(null);
      const typeData: QuizTypeCreateInput = { name: newTypeName.trim() };
      await quizTypeApi.create(typeData);
      setNewTypeName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('settings.quizTypes.errors.creating'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <input
          type="text"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          placeholder={t('settings.quizTypes.namePlaceholder')}
          className={styles.input}
          maxLength={100}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateType();
          }}
        />
        <Button
          variant="primary"
          onClick={handleCreateType}
          disabled={!newTypeName.trim()}
          loading={isCreating}
          icon={<MdAdd />}
        >
          {t('actions.add')}
        </Button>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {success && (
        <div className={styles.successMessage}>
          {t('settings.quizTypes.add.success')}
        </div>
      )}
    </div>
  );
};