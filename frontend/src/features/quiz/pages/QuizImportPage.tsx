import { useState } from 'react';
import { MdFileUpload, MdCheckCircle, MdInfo } from 'react-icons/md';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import { quizExchangeApi } from '@/features/quiz/api/exchangeApi';
import { Button } from '@/components/ui/Button/Button';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { FileDropZone } from '@/components/ui/FileDropZone/FileDropZone';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import styles from '@/features/quiz/styles/QuizImportPage.module.css';
import { UI } from '@/services/config';

export default function QuizImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.json')) {
      setError('Veuillez sélectionner un fichier JSON');
      setFile(null);
      return;
    }
      
    setFile(selectedFile);
    setError(null);
    setImportSuccess(false);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setImportSuccess(false);
      
      await quizExchangeApi.importQuizFile(file);
      setImportSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'importation du questionnaire');
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
    <MainLayout pageHeader={<PageHeader title="Importer un questionnaire" />}>
      <div className={styles.importContainer}>
        <div className={styles.infoSection}>
          <div className={styles.infoBox}>
            <MdInfo className={styles.infoIcon} />
            <div>
              <h3>Format d'importation</h3>
              <p>
                Le fichier importé doit être au format JSON et contenir toutes les données 
                nécessaires (questions, dimensions, etc.).
              </p>
              <p>
                Seuls les fichiers exportés depuis cette application sont garantis comme compatibles.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.importSection}>
          {importSuccess ? (
            <div className={styles.successMessage}>
              <MdCheckCircle className={styles.successIcon} />
              <h2>Importation réussie !</h2>
              <p>Votre questionnaire a été importé avec succès.</p>
              <div className={styles.actionButtons}>
                <Button 
                  variant="secondary" 
                  onClick={handleReset}
                >
                  Importer un autre questionnaire
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
                  Importer le questionnaire
                </Button>
              </div>
            </>
          )}
        </div>
        
      </div>
    </MainLayout>
  );
}