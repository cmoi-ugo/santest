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
  color = '#2196F3',
  height = 8,
  backgroundColor = '#e0e0e0',
  className = ''
}) => {
  const roundedPercentage = Math.round(percentage);

  return (
    <div className={`${styles.scoreContainer} ${className}`}>
      <div 
        className={styles.scoreBar}
        style={{ height: `${height}px`, backgroundColor }}
      >
        <div 
          className={styles.scoreIndicator}
          style={{ 
            width: `${roundedPercentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};