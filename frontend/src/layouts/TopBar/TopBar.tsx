import styles from '@/layouts/TopBar/TopBar.module.css';
import { ASSETS, ROUTES } from '@/config';
import { NavLink } from 'react-router-dom';

interface TopBarProps {
  railExpanded: boolean;
  children?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ railExpanded, children }) => {
  return (
    <div className={`${styles.topBar} ${railExpanded ? styles.railExpanded : ''}`}>
      <div className={styles.topBarContent}>
        <div className={styles.logoContainer}>
          <NavLink to={ROUTES.HOME} className={styles.logoLink}>
            <img 
              src={ASSETS.LOGO} 
              alt="Logo" 
              className={styles.logo}
            />
          </NavLink>
          <NavLink to={ROUTES.HOME} className={styles.appNameLink}>
            <img 
              src={ASSETS.APP_NAME} 
              alt="App Name" 
              className={styles.appName}
            />
          </NavLink>
        </div>
        {children}
      </div>
    </div>
  );
};