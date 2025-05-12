import styles from '@/components/TopBar/TopBar.module.css';

interface TopBarProps {
  railExpanded: boolean;
  children?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ railExpanded, children }) => {
  return (
    <div className={`${styles.topBar} ${railExpanded ? styles.railExpanded : ''}`}>
      <div className={styles.topBarContent}>
        {children}
      </div>
    </div>
  );
};