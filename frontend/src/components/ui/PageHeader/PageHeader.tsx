import React from 'react';

import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * En-tête de page standard avec titre et actions optionnelles
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  actions,
  children 
}) => {
  return (
    <div className={styles.pageHeader}>
      <h3 className={styles.pageTitle}>{title}</h3>
      {actions && <div className={styles.actions}>{actions}</div>}
      {children}
    </div>
  );
};