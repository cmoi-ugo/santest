import { useEffect, useRef, useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import { UI } from '@/config';
import { useTranslation } from '@/hooks';

import { quizTypeApi } from '../../../api/quizTypeApi';
import type { QuizType } from '../../../types/quiz.types';
import styles from './QuizTypeFilter.module.css';

interface QuizTypeFilterProps {
  selectedTypeId?: number;
  onChange: (selectedId?: number) => void;
  className?: string;
}

/**
 * Filtre horizontal avec scroll pour sélectionner un type de quiz
 */
export const QuizTypeFilter: React.FC<QuizTypeFilterProps> = ({
  selectedTypeId,
  onChange,
  className = ''
}) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [availableTypes, setAvailableTypes] = useState<QuizType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchQuizTypes();
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [availableTypes]);

  const fetchQuizTypes = async () => {
    try {
      setIsLoading(true);
      const types = await quizTypeApi.getAll();
      setAvailableTypes(types);
    } catch (err) {
      console.error('Failed to fetch quiz types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = UI.SCROLL?.AMOUNT || 250;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    setTimeout(checkScrollButtons, UI.TIMEOUTS?.SCROLL_CHECK || 300);
  };

  const handleFilterClick = (typeId?: number) => {
    onChange(typeId);
  };

  if (isLoading) {
    return (
      <div className={`${styles.filterContainer} ${className}`}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  if (availableTypes.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.filterContainer} ${className}`}>
      <div className={styles.filterWrapper}>
        {canScrollLeft && (
          <button 
            className={`${styles.scrollButton} ${styles.scrollLeft}`}
            onClick={() => scroll('left')}
            aria-label={t('quiz.cards.filters.scrollLeft')}
          >
            <MdChevronLeft size={UI.ICONS.SIZE.SMALL} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          className={styles.filterScrollContainer}
          onScroll={checkScrollButtons}
        >
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${!selectedTypeId ? styles.active : ''}`}
              onClick={() => handleFilterClick(undefined)}
            >
              {t('quiz.cards.filters.all')}
            </button>
            
            {availableTypes.map(type => (
              <button
                key={type.id}
                className={`${styles.filterButton} ${selectedTypeId === type.id ? styles.active : ''}`}
                onClick={() => handleFilterClick(type.id)}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {canScrollRight && (
          <button 
            className={`${styles.scrollButton} ${styles.scrollRight}`}
            onClick={() => scroll('right')}
            aria-label={t('quiz.cards.filters.scrollRight')}
          >
            <MdChevronRight size={UI.ICONS.SIZE.SMALL} />
          </button>
        )}
      </div>
    </div>
  );
};