import { MdMenu, MdSettings, MdHome, MdEditDocument, MdFavorite, MdAssessment, MdFileUpload, MdInfo } from "react-icons/md";
import { NavLink } from 'react-router-dom';
import styles from '@/layouts/LeftRail/LeftRail.module.css';
import { ROUTES, UI } from '@/services/config';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
  expanded: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ 
  icon, label, onClick, to, expanded 
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

export const LeftRail: React.FC<LeftRailProps> = ({ expanded, onToggle }) => {
  const toggleMenu = () => {
    onToggle();
  };

  return (
    <div className={`${styles.leftRail} ${expanded ? styles.expanded : ''}`}
         role="navigation" aria-label="Menu principal">
      <div className={styles.navButtons}>
        <NavButton 
          icon={<MdMenu size={UI.ICONS.SIZE.LARGE} />}
          label="Menu"
          onClick={toggleMenu}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdHome size={UI.ICONS.SIZE.LARGE} />}
          label="Accueil"
          to={ROUTES.HOME}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdAssessment size={UI.ICONS.SIZE.LARGE} />}
          label="Mes Résultats"
          to={ROUTES.RESULTS.HISTORY}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdFavorite size={UI.ICONS.SIZE.LARGE} />}
          label="Mes Favoris"
          to={ROUTES.FAVORITES}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdSettings size={UI.ICONS.SIZE.LARGE} />}
          label="Paramètres"
          to={ROUTES.SETTINGS}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdInfo size={UI.ICONS.SIZE.LARGE} />}
          label="Informations"
          to={ROUTES.INFOS}
          expanded={expanded}
        />

        <hr className={`${styles.separator}`}/>

        <NavButton 
          icon={<MdEditDocument size={UI.ICONS.SIZE.LARGE} />}
          label="Édition Quiz"
          to={ROUTES.QUIZ.LIST}
          expanded={expanded}
        />

        <NavButton 
          icon={<MdFileUpload size={UI.ICONS.SIZE.LARGE} />}
          label="Importer"
          to={ROUTES.QUIZ.IMPORT}
          expanded={expanded}
        />
      </div>
    </div>
  );
};