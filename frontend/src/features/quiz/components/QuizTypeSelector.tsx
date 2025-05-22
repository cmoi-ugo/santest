import { useState, useEffect } from 'react';
import { quizTypeApi } from '@/features/quiz/api/quizTypeApi';
import { QuizType } from '@/features/quiz/types/quiz.types';
import { FormField } from '@/components/ui/FormField/FormField';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import styles from '@/features/quiz/styles/QuizTypeSelector.module.css';

interface QuizTypeSelectorProps {
  selectedTypeId?: number;
  onChange: (selectedId?: number) => void;
  disabled?: boolean;
}

export const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({
  selectedTypeId,
  onChange,
  disabled = false
}) => {
  const [availableTypes, setAvailableTypes] = useState<QuizType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizTypes();
  }, []);

  const fetchQuizTypes = async () => {
    try {
      setIsLoading(true);
      const types = await quizTypeApi.getAll();
      setAvailableTypes(types);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les types de questionnaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange(value ? parseInt(value) : undefined);
  };

  if (isLoading) {
    return (
      <FormField>
        <div className={styles.loading}>Chargement des types ...</div>
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
        <div className={styles.noTypes}>
          Aucun type disponible. Créez d'abord des types par défaut.
        </div>
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
        <option value="">Aucun type sélectionné</option>
        {availableTypes.map(type => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </FormField>
  );
};