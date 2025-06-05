import React from 'react';
import { MdAssessment, MdEditDocument, MdFavorite, MdFileUpload, MdHome, MdInfo, MdMenu, MdSettings } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

import { ROUTES, UI } from '@/config';
import { useTranslation } from '@/hooks';

import styles from './LeftRail.module.css';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
  expanded: boolean;
}

/**
 * Bouton de navigation avec support pour liens internes et actions
 */
const NavButton: React.FC<NavButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  to, 
  expanded 
}) => {
  const content = (
    <div className={styles.icon}>
      {icon}
      {expanded && <span className={styles.buttonLabel}>{label}</span>}
    </div>
  );
  
  if (to) {
    return (
      <NavLink 
        to={to} 
        className={({ isActive }) => 
          `${styles.navButton} ${isActive ? styles.active : ''}`
        }
      >
        {content}
      </NavLink>
    );
  }
  
  return (
    <button onClick={onClick} className={styles.navButton}>
      {content}
    </button>
  );
};

interface LeftRailProps {
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Rail de navigation latéral gauche avec menu extensible
 */
export const LeftRail: React.FC<LeftRailProps> = ({ expanded, onToggle }) => {
  const { t } = useTranslation();

  return (
    <div 
      className={`${styles.leftRail} ${expanded ? styles.expanded : ''}`}
      role="navigation" 
      aria-label={t('common.menu')}
    >
      <div className={styles.navButtons}>
        <NavButton 
          icon={<MdMenu size={UI.ICONS.SIZE.LARGE} />}
          label={t('common.menu')}
          onClick={onToggle}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdHome size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.home')}
          to={ROUTES.HOME}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdAssessment size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.results')}
          to={ROUTES.RESULTS.HISTORY}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdFavorite size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.favorites')}
          to={ROUTES.FAVORITES}
          expanded={expanded}
        />

        <hr className={styles.separator} />

        <NavButton 
          icon={<MdEditDocument size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.editor')}
          to={ROUTES.QUIZ.MANAGE}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdFileUpload size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.import')}
          to={ROUTES.QUIZ.IMPORT}
          expanded={expanded}
        />

        <hr className={styles.separator} />

        <NavButton 
          icon={<MdSettings size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.settings')}
          to={ROUTES.SETTINGS}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdInfo size={UI.ICONS.SIZE.LARGE} />}
          label={t('navigation.about')}
          to={ROUTES.ABOUT}
          expanded={expanded}
        />
      </div>
    </div>
  );
};