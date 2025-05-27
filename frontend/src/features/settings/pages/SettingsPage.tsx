import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { DarkModeToggle } from '@/features/settings/components/DarkModeToggle/DarkModeToggle';
import { LanguageSelector } from '@/features/settings/components/LanguageSelector/LanguageSelector';
import { ResetApplicationSection } from '@/features/settings/components/ResetApplicationSection/ResetApplicationSection';
import { SettingsSection } from '@/features/settings/components/SettingsSection/SettingsSection';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('settings.title')} />}>
      <div className={styles.settingsContainer}>
        <SettingsSection
          title={t('settings.appearance.title')}
          description={t('settings.appearance.description')}
          action={<DarkModeToggle />}
        />

        <SettingsSection
          title={t('settings.language.title')}
          description={t('settings.language.description')}
          action={<LanguageSelector />}
        />

        <SettingsSection
          title={t('settings.reset.title')}
          description={t('settings.reset.description')}
          action={<ResetApplicationSection />}
        />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;