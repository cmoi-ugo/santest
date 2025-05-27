import { useDarkMode } from '@/context/DarkModeContext';
import { Button } from '@/components/ui/Button/Button';

export const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button 
      variant="primary" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {darkMode ? 'Mode clair' : 'Mode sombre'}
    </Button>
  );
};