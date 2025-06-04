import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config';

const FIRST_VISIT_KEY = 'santest-first-visit';

export const FirstVisitRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === ROUTES.ABOUT) return;
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    
    if (!hasVisited) {
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
      navigate(ROUTES.ABOUT, { replace: true });
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};