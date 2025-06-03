import React from 'react';
import styles from './ScoreBar.module.css';

export type ScoreSeverity = 'info' | 'warning' | 'danger' | 'default';

interface ScoreBarProps {
  percentage: number;
  severity?: ScoreSeverity;
  className?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  percentage,
  severity = 'default',
  className = ''
}) => {
  const roundedPercentage = Math.round(percentage);
  
  const getSeverityClass = (severity: ScoreSeverity): string => {
    switch (severity) {
      case 'info': return styles.scoreInfo;
      case 'warning': return styles.scoreWarning;
      case 'danger': return styles.scoreDanger;
      case 'default': return styles.scoreDefault;
      default: return styles.scoreInfo;
    }
  };

  return (
    <div className={`${styles.scoreContainer} ${className}`}>
      <div className={styles.scoreBar}>
        <div 
          className={`${styles.scoreIndicator} ${getSeverityClass(severity)}`}
          style={{ width: `${roundedPercentage}%` }}
        />
      </div>
    </div>
  );
};