import ReactMarkdown from 'react-markdown';

import aboutContent from '@/assets/markdown/about.md?raw';
import markdownStyles from '@/assets/styles/markdown.module.css';
import { PageHeader } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

/**
 * Page À propos affichant le contenu markdown de présentation de l'application
 */
const AboutPage = () => {
  const { t } = useTranslation();
  
  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.about.title')} />}>
      <div className={markdownStyles.markdownContent}>
        <ReactMarkdown>{aboutContent}</ReactMarkdown>
      </div>
    </MainLayout>
  );
};

export default AboutPage;