import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { MdSearch, MdClear } from 'react-icons/md';
import styles from './QuizSearchBar.module.css';

interface QuizSearchBarProps {
  searchTerm: string;
  onChange: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export const QuizSearchBar: React.FC<QuizSearchBarProps> = ({
  searchTerm,
  onChange,
  placeholder,
  className = ''
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('quiz.cards.searchPlaceholder');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(localSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, onChange]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    onChange('');
  };

  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchInputWrapper}>
        <MdSearch className={styles.searchIcon} />
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleInputChange}
          placeholder={defaultPlaceholder}
          className={styles.searchInput}
        />
        {localSearchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label={t('quiz.cards.clearSearch')}
          >
            <MdClear />
          </button>
        )}
      </div>
    </div>
  );
};