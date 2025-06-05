import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { AddQuizType } from '../components/AddQuizType/AddQuizType';
import { DeleteQuizType } from '../components/DeleteQuizType/DeleteQuizType';
import { DarkModeToggle } from '../components/DarkModeToggle/DarkModeToggle';
import { LanguageSelector } from '../components/LanguageSelector/LanguageSelector';
import { ResetApplicationSection } from '../components/ResetApplicationSection/ResetApplicationSection';
import { SettingsSection } from '../components/SettingsSection/SettingsSection';
import styles from './SettingsPage.module.css';

/**
 * Page de paramètres de l'application avec toutes les options de configuration
 */
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
          title={t('settings.quizTypes.add.title')}
          description={t('settings.quizTypes.add.description')}
          action={<AddQuizType />}
        />

        <SettingsSection
          title={t('settings.quizTypes.delete.title')}
          description={t('settings.quizTypes.delete.description')}
          action={<DeleteQuizType />}
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