import React from 'react';

import { ASSETS } from '@/config';

import styles from './Card.module.css';

interface CardProps {
  title: React.ReactNode;
  imageUrl?: string | null;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  actions?: React.ReactNode;
}

/**
 * Composant carte réutilisable avec image, titre et actions
 */
export const Card: React.FC<CardProps> = ({
  title,
  imageUrl,
  onClick,
  children,
  className = '',
  imageClassName = '',
  contentClassName = '',
  actions
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-action-button]')) {
      return;
    }
    if (onClick) onClick();
  };

  const getDefaultImagePath = (): string => {
    return ASSETS.DEFAULT_IMAGES.QUIZ;
  };

  return (
    <div 
      className={`${styles.card} ${className}`}
      onClick={handleCardClick}
    >
      <div className={`${styles.cardImageContainer} ${imageClassName}`}>
        <img 
          src={imageUrl || getDefaultImagePath()}
          alt={typeof title === 'string' ? title : 'Card image'}
          className={styles.cardImage}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = getDefaultImagePath();
          }}
        />
      </div>
      <div className={`${styles.cardContent} ${contentClassName}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {actions && (
            <div className={styles.cardActions} data-action-button>
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};