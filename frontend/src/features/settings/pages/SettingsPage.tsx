import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { DarkModeToggle } from '@/features/settings/components/DarkModeToggle/DarkModeToggle';
import { ResetApplicationSection } from '@/features/settings/components/ResetApplicationSection/ResetApplicationSection';
import { SettingsSection } from '@/features/settings/components/SettingsSection/SettingsSection';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Paramètres" />}>
      <div className={styles.settingsContainer}>
        <SettingsSection
          title="Apparence"
          description="Basculer entre le mode clair et sombre"
          action={<DarkModeToggle />}
        />

        <SettingsSection
          title="Réinitialisation de l'application"
          description="Supprime toutes les données et remet l'application à son état initial"
          action={<ResetApplicationSection />}
        />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;