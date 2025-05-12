import { MainLayout } from '@/components/MainLayout/MainLayout';
import styles from '@/features/settings/pages/SettingsPage.module.css';

const SettingsPage = () => {
  const pageHeader = (
    <div className={styles.header}>
      <h3 className={styles.title}>
        Paramètres
      </h3>
    </div>
  );

  return (
    <MainLayout pageHeader={pageHeader}>
      Paramètres (TODO)
    </MainLayout>
  );
};

export default SettingsPage;