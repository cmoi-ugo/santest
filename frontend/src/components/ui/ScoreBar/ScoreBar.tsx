import React from 'react';
import styles from './ScoreBar.module.css';

interface ScoreBarProps {
  percentage: number;
  color?: string;
  showPercentage?: boolean;
  height?: number;
  backgroundColor?: string;
  className?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  percentage,
  className = ''
}) => {
  const roundedPercentage = Math.round(percentage);

  return (
    <div className={`${styles.scoreContainer} ${className}`}>
      <div 
        className={styles.scoreBar}
      >
        <div 
          className={styles.scoreIndicator}
          style={{ 
            width: `${roundedPercentage}%`
          }}
        />
      </div>
    </div>
  );
};