import { useState } from 'react';
import { MdCheckCircle, MdFileUpload, MdInfo } from 'react-icons/md';

import { Button, FileDropZone, LoadingIndicator, PageHeader } from '@/components/ui';
import { UI } from '@/config';
import { useTranslation } from '@/hooks';
import { MainLayout } from '@/layouts';

import { quizExchangeApi } from '../../api/quizExchangeApi';
import styles from './QuizImportPage.module.css';

/**
 * Page d'importation de quiz depuis des fichiers JSON avec validation et feedback
 */
export default function QuizImportPage() {
  const { t } = useTranslation();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.json')) {
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
      setFile(null);
    } catch (err: any) {
      const errorMessage = err?.message || t('quiz.import.importError');
      setError(errorMessage);
      setImportSuccess(false);
      console.error('Failed to import quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setImportSuccess(false);
  };

  const canImport = file && !loading;

  return (
    <MainLayout pageHeader={<PageHeader title={t('pages.quizImport.title')} />}>
      <div className={styles.importContainer}>
        <div className={styles.infoSection}>
          <div className={styles.infoBox}>
            <MdInfo className={styles.infoIcon} size={UI.ICONS.SIZE.LARGE} />
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>
                {t('quiz.import.formatTitle')}
              </h3>
              <p className={styles.infoDescription}>
                {t('quiz.import.formatDescription')}
              </p>
              <p className={styles.compatibilityNote}>
                {t('quiz.import.compatibilityNote')}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.importSection}>
          {importSuccess ? (
            <div className={styles.successMessage}>
              <MdCheckCircle 
                className={styles.successIcon} 
                size={UI.ICONS.SIZE.LARGE * 2} 
              />
              <h2 className={styles.successTitle}>
                {t('quiz.import.importSuccess')}
              </h2>
              <p className={styles.successDescription}>
                {t('quiz.import.importSuccessDescription')}
              </p>
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
            <div className={styles.importForm}>
              {loading ? (
                <LoadingIndicator message={t('quiz.import.importing')} />
              ) : (
                <FileDropZone 
                  onFileSelected={handleFileSelected}
                  file={file}
                  error={error}
                  accept=".json"
                />
              )}
              
              <div className={styles.actionButtons}>                
                <Button 
                  variant="primary" 
                  onClick={handleImport}
                  disabled={!canImport}
                  loading={loading}
                  icon={<MdFileUpload size={UI.ICONS.SIZE.MEDIUM} />}
                >
                  {t('quiz.import.importButton')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}