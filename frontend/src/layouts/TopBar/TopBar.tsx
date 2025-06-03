import styles from '@/layouts/TopBar/TopBar.module.css';
import { MdCircle, MdArrowRightAlt } from "react-icons/md";
import { ASSETS, ROUTES, UI } from '@/config';
import { NavLink } from 'react-router-dom';

interface TopBarProps {
  railExpanded: boolean;
  children?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ railExpanded, children }) => {
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
          to="https://cmoi-ugo.github.io/santest/" 
          className={styles.docLink}
          target="_blank"
        >
          <p>Documentation</p>
          <MdArrowRightAlt size={UI.ICONS.SIZE.MEDIUM}/>
        </NavLink>
      </div>
    </div>
  );
};