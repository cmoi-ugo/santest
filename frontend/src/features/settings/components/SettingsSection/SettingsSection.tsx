import React from 'react';
import styles from './SettingsSection.module.css';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  action
}) => {
  return (
    <div className={styles.settingsSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      
      {description && action ? (
        <div className={styles.settingItem}>
          <p className={styles.settingDescription}>{description}</p>
          {action}
        </div>
      ) : (
        <div className={styles.sectionContent}>
          {description && (
            <p className={styles.settingDescription}>{description}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
};