import { useEffect, useState } from 'react';

import { ErrorMessage, FormField } from '@/components/ui';
import { useTranslation } from '@/hooks';

import { quizTypeApi } from '../../../api/quizTypeApi';
import type { QuizType } from '../../../types/quiz.types';
import styles from './QuizTypeSelector.module.css';

interface QuizTypeSelectorProps {
  selectedTypeId?: number;
  onChange: (selectedId?: number) => void;
  disabled?: boolean;
  refreshTrigger?: number;
}

/**
 * Sélecteur dropdown pour choisir un type de quiz avec gestion du refresh
 */
export const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({
  selectedTypeId,
  onChange,
  disabled = false,
  refreshTrigger = 0
}) => {
  const { t } = useTranslation();
  const [availableTypes, setAvailableTypes] = useState<QuizType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizTypes();
  }, [refreshTrigger]);

  const fetchQuizTypes = async () => {
    try {
      setIsLoading(true);
      const types = await quizTypeApi.getAll();
      setAvailableTypes(types);
      setError(null);
    } catch (err) {
      setError(t('quiz.cards.errors.loadingTypes'));
      console.error('Failed to fetch quiz types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange(value ? parseInt(value, 10) : undefined);
  };

  if (isLoading) {
    return (
      <FormField>
        <div className={styles.loading}>{t('common.loading')}</div>
      </FormField>
    );
  }

  if (error) {
    return (
      <FormField>
        <ErrorMessage message={error} />
      </FormField>
    );
  }

  if (availableTypes.length === 0) {
    return (
      <FormField>
        <div className={styles.noTypes}>{t('quiz.cards.emptyStates.noTypeSelected')}</div>
      </FormField>
    );
  }

  return (
    <FormField>
      <select
        value={selectedTypeId || ''}
        onChange={handleSelectChange}
        disabled={disabled}
        className={`${styles.select} ${disabled ? styles.disabled : ''}`}
      >
        <option value="">{t('quiz.cards.emptyStates.noTypeSelected')}</option>
        {availableTypes.map(type => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </FormField>
  );
};