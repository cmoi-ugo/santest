import { useState } from 'react';

import { LeftRail, TopBar } from '@/layouts';

import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  pageHeader?: React.ReactNode;
}

/**
 * Layout principal de l'application avec rail latéral et barre supérieure
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children, pageHeader }) => {
  const [railExpanded, setRailExpanded] = useState(false);
  
  const toggleRail = () => {
    setRailExpanded(!railExpanded);
  };

  return (
    <div className="layoutContainer">
      <LeftRail expanded={railExpanded} onToggle={toggleRail} />
      <TopBar railExpanded={railExpanded}>
        {pageHeader} 
      </TopBar>
      <main className={`${styles.mainContent} ${railExpanded ? styles.railExpanded : ''}`}>
        {children}
      </main>
    </div>
  );
};