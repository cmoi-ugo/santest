import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const InfosPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="Informations" />}>
      <div className={styles.container}>

      </div>
    </MainLayout>
  );
};

export default InfosPage;