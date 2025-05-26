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
  placeholder = "Rechercher un questionnaire ...",
  className = ''
}) => {
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
          placeholder={placeholder}
          className={styles.searchInput}
        />
        {localSearchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Effacer la recherche"
          >
            <MdClear />
          </button>
        )}
      </div>
    </div>
  );
};