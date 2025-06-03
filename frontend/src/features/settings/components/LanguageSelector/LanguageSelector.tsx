import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './LanguageSelector.module.css';

export const LanguageSelector = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as keyof typeof availableLanguages;
    setLanguage(newLanguage);
  };

  return (
    <div className={styles.languageSelector}>
      <select 
        value={language}
        onChange={handleLanguageChange}
        className={styles.languageSelect}
        aria-label={t('settings.language.selectLabel')}
      >
        {Object.entries(availableLanguages).map(([code, info]) => (
          <option key={code} value={code}>
            {info.nativeName} {info.flag}
          </option>
        ))}
      </select>
    </div>
  );
};