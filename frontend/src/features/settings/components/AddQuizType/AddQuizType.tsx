import { useState } from 'react';
import { MdAdd } from 'react-icons/md';

import { Button, ErrorMessage } from '@/components/ui';
import { UI } from '@/config';
import { quizTypeApi } from '@/features/quiz/api/quizTypeApi';
import { QuizTypeCreateInput } from '@/features/quiz/types/quiz.types';
import { useTranslation } from '@/hooks';

import styles from './AddQuizType.module.css';

/**
 * Composant pour ajouter un nouveau type de quiz personnalisé
 */
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
      setTimeout(() => setSuccess(false), UI.TIMEOUTS?.SUCCESS_MESSAGE || 3000);
    } catch (err) {
      setError(t('settings.quizTypes.errors.creating'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateType();
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
          maxLength={UI.LIMITS.QUIZ_TYPE_NAME_MAX_LENGTH || 100}
          onKeyDown={handleKeyDown}
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