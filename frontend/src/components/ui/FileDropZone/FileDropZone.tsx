import React, { useState } from 'react';
import { MdDescription, MdFileUpload } from 'react-icons/md';

import { useTranslation } from '@/hooks';

import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import styles from './FileDropZone.module.css';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  file: File | null;
  accept?: string;
  error?: string | null;
}

/**
 * Zone de dépôt de fichiers avec support drag & drop
 */
export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelected,
  file,
  accept = '.json',
  error
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`${styles.dropZone} ${dragActive ? styles.active : ''} ${file ? styles.hasFile : ''} ${error ? styles.error : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file"
        id="fileInput"
        className={styles.fileInput}
        onChange={handleFileChange}
        accept={accept}
      />
      
      {file ? (
        <div className={styles.selectedFile}>
          {!error && (
            <>
              <MdDescription className={styles.fileIcon} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {t('file.size', { size: (file.size / 1024).toFixed(1) })}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.dropContent}>
          <MdFileUpload className={styles.uploadIcon} />
          <div className={styles.dropInstructions}>
            <p className={styles.dropText}>
              {t('ui.fileDropZone.dragAndDrop')}
            </p>
            <span className={styles.dropOr}>{t('common.or')}</span>
            <label htmlFor="fileInput" className={styles.browseButton}>
              {t('ui.fileDropZone.selectFile')}
            </label>
          </div>
        </div>
      )}
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};