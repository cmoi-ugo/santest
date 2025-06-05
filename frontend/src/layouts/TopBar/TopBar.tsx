import React from 'react';
import { MdArrowRightAlt, MdCircle } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

import { ASSETS, ROUTES, UI } from '@/config';
import { useTranslation } from '@/hooks';

import styles from './TopBar.module.css';

interface TopBarProps {
  railExpanded: boolean;
  children?: React.ReactNode;
}

/**
 * Barre supérieure avec logo, breadcrumb et lien vers la documentation
 */
export const TopBar: React.FC<TopBarProps> = ({ railExpanded, children }) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.topBar} ${railExpanded ? styles.railExpanded : ''}`}>
      <div className={styles.topBarContent}>
        
        <div className={styles.leftSection}>
          <div className={styles.logoContainer}>
            <NavLink to={ROUTES.HOME} className={styles.logoLink}>
              <img 
                src={ASSETS.LOGO} 
                alt="Logo" 
                className={styles.logo}
              />
              <img 
                src={ASSETS.APP_NAME} 
                alt="App Name" 
                className={styles.appName}
              />
            </NavLink>
          </div>

          {children && (
            <>
              <MdCircle size={UI.ICONS.SIZE.MICRO} />
              {children}
            </>
          )}
        </div>

        <NavLink 
          to={UI.EXTERNAL_LINKS.DOCUMENTATION} 
          className={styles.docLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p>{t('navigation.doc')}</p>
          <MdArrowRightAlt size={UI.ICONS.SIZE.MEDIUM} />
        </NavLink>
      </div>
    </div>
  );
};