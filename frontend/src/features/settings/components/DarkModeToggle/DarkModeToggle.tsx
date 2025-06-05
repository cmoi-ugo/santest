import { Button } from '@/components/ui';
import { useDarkMode } from '@/context/DarkModeContext';
import { useTranslation } from '@/hooks';

/**
 * Bouton de basculement entre mode sombre et mode clair
 */
export const DarkModeToggle = () => {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button 
      variant="primary" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? t('settings.appearance.switchToLight') : t('settings.appearance.switchToDark')}
    >
      {darkMode ? t('settings.appearance.lightMode') : t('settings.appearance.darkMode')}
    </Button>
  );
};