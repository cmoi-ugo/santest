import { useState } from 'react';
import { IoMenu } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
import styles from '@/features/home/components/Home.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export const Home = () => {
  const navigate = useNavigate();
  const clearToken = useAuthStore((state) => state.clearToken);
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    clearToken(); 
    navigate('/login');
  };

  const toggleMenu = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={styles.homePage}>
      <div className={`${styles.leftRail} ${expanded ? styles.expanded : ''}`}>
        <div className={styles.navButtons}>
            <button 
                onClick={toggleMenu}
                className={`${styles.navButton}`}
            >
                <div className={styles.burgerIcon}>
                    <IoMenu size={28} color="#1e1e1e" />
                    {expanded && <span className={styles.buttonLabel}>Menu</span>}
                </div>
            </button>
            <button 
                className={`${styles.navButton}`}
            >
                <div className={styles.settingsIcon}>
                    <MdOutlineSettings size={28} color="#1e1e1e" />
                    {expanded && <span className={styles.buttonLabel}>Paramètres</span>}
                </div>
            </button>
            <button 
                onClick={handleLogout} 
                className={`${styles.navButton}`}
            >
                <div className={styles.logoutIcon}>
                    <MdOutlineLogout size={28} color="#1e1e1e" />
                    {expanded && <span className={styles.buttonLabel}>Déconnexion</span>}
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};