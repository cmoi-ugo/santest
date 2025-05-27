import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { MdFileUpload, MdCheckCircle, MdInfo } from 'react-icons/md';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { quizExchangeApi } from '@/features/quiz/api/quizExchangeApi';
import { Button } from '@/components/ui/Button/Button';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { FileDropZone } from '@/components/ui/FileDropZone/FileDropZone';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import styles from './QuizImportPage.module.css';
import { UI } from '@/config';

export default function QuizImportPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.json')) {
      setError(t('quiz.import.selectFileError'));
      setFile(null);
      return;
    }
      
    setFile(selectedFile);
    setError(null);
    setImportSuccess(false);
  };

  const handleImport = async () => {
    if (!file) {
      setError(t('quiz.import.noFileError'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setImportSuccess(false);
      
      await quizExchangeApi.importQuizFile(file);
      setImportSuccess(true);
    } catch (err: any) {
      setError(err.message || t('quiz.import.importError'));
      setImportSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setImportSuccess(false);
  };

  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizImport.title')} />}>
      <div className={styles.importContainer}>
        <div className={styles.infoSection}>
          <div className={styles.infoBox}>
            <MdInfo className={styles.infoIcon} />
            <div>
              <h3>{t('quiz.import.formatTitle')}</h3>
              <p>{t('quiz.import.formatDescription')}</p>
              <p>{t('quiz.import.compatibilityNote')}</p>
            </div>
          </div>
        </div>

        <div className={styles.importSection}>
          {importSuccess ? (
            <div className={styles.successMessage}>
              <MdCheckCircle className={styles.successIcon} />
              <h2>{t('quiz.import.importSuccess')}</h2>
              <p>{t('quiz.import.importSuccessDescription')}</p>
              <div className={styles.actionButtons}>
                <Button 
                  variant="primary" 
                  onClick={handleReset}
                >
                  {t('quiz.import.importAnother')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {loading ? 
                <LoadingIndicator /> :
                <FileDropZone 
                  onFileSelected={handleFileSelected}
                  file={file}
                  error={error}
                />
              }
              
              <div className={styles.actionButtons}>                
                <Button 
                  variant="primary" 
                  onClick={handleImport}
                  disabled={!file || loading}
                  icon={<MdFileUpload size={UI.ICONS.SIZE.MEDIUM} />}
                >
                  {t('quiz.import.importButton')}
                </Button>
              </div>
            </>
          )}
        </div>
        
      </div>
    </MainLayout>
  );
}