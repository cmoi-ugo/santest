import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { DarkModeToggle } from '@/features/settings/components/DarkModeToggle';

const SettingsPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Paramètres" />}>
      Paramètres (TODO)
      <DarkModeToggle/>
    </MainLayout>
  );
};

export default SettingsPage;