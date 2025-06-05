import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES, STORAGE_KEYS } from '@/config';

/**
 * Composant de redirection pour les nouveaux utilisateurs vers la page À propos
 */
export const FirstVisitRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === ROUTES.ABOUT) return;
    const hasVisited = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
    
    if (!hasVisited) {
      localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
      navigate(ROUTES.ABOUT, { replace: true });
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};