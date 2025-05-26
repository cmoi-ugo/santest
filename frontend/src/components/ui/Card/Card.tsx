import React from 'react';
import styles from './Card.module.css';
import { ASSETS } from '@/config';

interface CardProps {
  title: React.ReactNode;
  imageUrl?: string | null;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  imageUrl,
  onClick,
  children,
  className = '',
  imageClassName = '',
  contentClassName = ''
}) => {
  const handleCardClick = () => {
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
          onError={(e) => {
            e.currentTarget.src = getDefaultImagePath();
          }}
        />
      </div>
      <div className={`${styles.cardContent} ${contentClassName}`}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {children}
      </div>
    </div>
  );
};