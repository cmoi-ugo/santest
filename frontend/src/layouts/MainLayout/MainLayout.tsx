import { useState } from 'react';
import styles from '@/layouts/MainLayout/MainLayout.module.css';
import { LeftRail } from '@/layouts/LeftRail/LeftRail';
import { TopBar } from '@/layouts/TopBar/TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
  pageHeader?: React.ReactNode;
}

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