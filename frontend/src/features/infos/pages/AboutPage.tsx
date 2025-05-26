import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import styles from '@/features/quiz/styles/QuizCards.module.css';

const AboutPage = () => {
  return (
    <MainLayout pageHeader={<PageHeader title="À propos" />}>
      <div className={styles.container}>

      </div>
    </MainLayout>
  );
};

export default AboutPage;