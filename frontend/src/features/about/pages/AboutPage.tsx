import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import markdownStyles from '@/assets/styles/markdown.module.css';
import ReactMarkdown from 'react-markdown';
import aboutContent from '@/assets/markdown/about.md?raw';

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